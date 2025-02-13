import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { ElevenLabsClient } from 'elevenlabs';
import fetch from 'node-fetch';
import { defineSecret } from 'firebase-functions/params';

admin.initializeApp();

// Define environment variables
const elevenlabsApiKey = defineSecret('ELEVENLABS_API_KEY');
const hedraApiKey = defineSecret('HEDRA_API_KEY');

// ElevenLabs API configuration
const ELEVENLABS_CONSTANTS = {
  TTS: {
    MODEL: 'eleven_flash_v2_5',
    VOICE_ID: 'cgSgspJ2msm6clMCkdW9', // Jessica voice
  }
} as const;

const HEDRA_BASE_URL = 'https://mercury.dev.dream-ai.com/api';
const REFERENCE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/myspiritualpowers-6cc8d.appspot.com/o/reference_faces%2F1.png?alt=media';

interface VideoGenerationData {
  userId: string;
  script: string;
  status: 'pending' | 'audio_generated' | 'video_generated' | 'complete' | 'error';
  audioUrl?: string;
  videoUrl?: string;
  error?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface QuizResultData {
  videoScript: {
    script: string;
  };
}

async function generateAudioWithElevenLabs(script: string): Promise<Buffer> {
  const client = new ElevenLabsClient({
    apiKey: elevenlabsApiKey.value(),
  });

  try {
    const audioStream = await client.generate(
      {
        voice: ELEVENLABS_CONSTANTS.TTS.VOICE_ID,
        model_id: ELEVENLABS_CONSTANTS.TTS.MODEL,
        text: script,
      }
    );

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error;
  }
}

async function generateVideoWithHedra(audioUrl: string): Promise<string> {
  // Create video generation request
  const response = await fetch(`${HEDRA_BASE_URL}/videos`, {
    method: 'POST',
    headers: {
      'X-API-KEY': hedraApiKey.value(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      reference_image_url: REFERENCE_IMAGE_URL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create video: ${response.statusText}`);
  }

  const data = await response.json();
  const videoId = data.id;

  // Poll for completion (max 9 minutes to leave buffer for other operations)
  for (let i = 0; i < 54; i++) { // 54 iterations * 10 seconds = 540 seconds (9 minutes)
    const statusResponse = await fetch(`${HEDRA_BASE_URL}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': hedraApiKey.value(),
        'Content-Type': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check video status: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.status === 'completed') {
      // Get video URL
      const videoResponse = await fetch(`${HEDRA_BASE_URL}/videos/${videoId}/download`, {
        method: 'GET',
        headers: {
          'X-API-KEY': hedraApiKey.value(),
        },
      });

      if (!videoResponse.ok) {
        throw new Error(`Failed to get video URL: ${videoResponse.statusText}`);
      }

      const videoData = await videoResponse.json();
      return videoData.url;
    }

    if (statusData.status === 'failed') {
      throw new Error('Video generation failed');
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error('Video generation timed out');
}

export const generateVideo2 = onDocumentCreated(
  {
    document: 'quiz_results/{userId}',
    region: 'us-central1',
    memory: '2GiB',
    timeoutSeconds: 540,
    secrets: [elevenlabsApiKey, hedraApiKey],
  },
  async (event) => {
    console.log('Function triggered with event params:', event.params);
    console.log('Document path:', `quiz_results/${event.params.userId}`);
    
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const quizData = snapshot.data() as QuizResultData;
    console.log('Quiz data:', quizData);
    const userId = event.params.userId;
    console.log('User ID:', userId);
    
    // Create a document to track video generation progress
    const videoRef = admin.firestore().collection('video_generations').doc(userId);
    
    try {
      // Initialize video generation tracking
      const videoData: VideoGenerationData = {
        userId,
        script: quizData.videoScript.script,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      await videoRef.set(videoData);

      // Generate audio with ElevenLabs
      const audioBuffer = await generateAudioWithElevenLabs(quizData.videoScript.script);

      // Upload audio to Firebase Storage
      const bucket = admin.storage().bucket();
      const audioFileName = `video_generations/${userId}/audio.mp3`;
      const audioFile = bucket.file(audioFileName);
      
      await audioFile.save(audioBuffer);
      
      // Get the public URL for the audio file
      const [audioUrl] = await audioFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
      });

      // Update video generation status
      await videoRef.update({
        status: 'audio_generated',
        audioUrl,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Generate video with Hedra
      try {
        const hedraVideoUrl = await generateVideoWithHedra(audioUrl);
        
        // Download video from Hedra
        const videoResponse = await fetch(hedraVideoUrl);
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

        // Upload to Firebase Storage
        const videoFileName = `video_generations/${userId}/video.mp4`;
        const videoFile = bucket.file(videoFileName);
        
        await videoFile.save(videoBuffer, {
          metadata: {
            contentType: 'video/mp4',
          },
        });

        // Get the public URL for the video
        const [videoUrl] = await videoFile.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        });

        // Update status to complete
        await videoRef.update({
          status: 'complete',
          videoUrl,
          updatedAt: admin.firestore.Timestamp.now(),
        });

      } catch (videoError) {
        console.error('Error generating video:', videoError);
        await videoRef.update({
          status: 'error',
          error: videoError instanceof Error ? videoError.message : 'Video generation failed',
          updatedAt: admin.firestore.Timestamp.now(),
        });
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error in video generation process:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update video generation status with error
      await videoRef.update({
        status: 'error',
        error: errorMessage,
        updatedAt: admin.firestore.Timestamp.now(),
      });
      
      return { success: false, error: errorMessage };
    }
  }
); 