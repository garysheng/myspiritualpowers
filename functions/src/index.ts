import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { ElevenLabsClient } from 'elevenlabs';
import fetch from 'node-fetch';

admin.initializeApp();

// Get environment variables
const elevenlabsApiKey = functions.config().elevenlabs?.api_key;
const hedraApiKey = functions.config().hedra?.api_key;

if (!elevenlabsApiKey) {
  throw new Error('Missing ElevenLabs API key. Set it using firebase functions:config:set elevenlabs.api_key="YOUR_API_KEY"');
}

if (!hedraApiKey) {
  throw new Error('Missing Hedra API key. Set it using firebase functions:config:set hedra.api_key="YOUR_API_KEY"');
}

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

async function generateAudioWithElevenLabs(text: string): Promise<Buffer> {
  try {
    // Initialize ElevenLabs with explicit API key
    const elevenLabs = new ElevenLabsClient({
      apiKey: elevenlabsApiKey
    });

    const audioStream = await elevenLabs.generate({
      text,
      model_id: ELEVENLABS_CONSTANTS.TTS.MODEL,
      voice: ELEVENLABS_CONSTANTS.TTS.VOICE_ID,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    console.error('Error synthesizing audio:', {
      error,
      message: error?.message,
      stack: error?.stack
    });
    throw error;
  }
}

async function generateVideoWithHedra(audioUrl: string): Promise<string> {
  // Upload audio to Hedra
  const audioResponse = await fetch(`${HEDRA_BASE_URL}/v1/audio`, {
    method: 'POST',
    headers: {
      'X-API-KEY': hedraApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: audioUrl }),
  });

  if (!audioResponse.ok) {
    throw new Error(`Hedra audio upload failed: ${await audioResponse.text()}`);
  }

  const { url: hedraAudioUrl } = await audioResponse.json();

  // Generate video
  const videoResponse = await fetch(`${HEDRA_BASE_URL}/v1/characters`, {
    method: 'POST',
    headers: {
      'X-API-KEY': hedraApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      avatarImage: REFERENCE_IMAGE_URL,
      audioSource: "audio",
      voiceUrl: hedraAudioUrl,
      aspectRatio: "16:9",
      text: "",
      voiceId: null,
    }),
  });

  if (!videoResponse.ok) {
    throw new Error(`Hedra video generation failed: ${await videoResponse.text()}`);
  }

  const { jobId } = await videoResponse.json();
  console.log('Video generation started:', jobId);

  // Poll for completion (max 5 minutes)
  for (let i = 0; i < 30; i++) {
    const statusResponse = await fetch(`${HEDRA_BASE_URL}/v1/projects/${jobId}`, {
      headers: { 'X-API-KEY': hedraApiKey },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check video status: ${await statusResponse.text()}`);
    }

    const status = await statusResponse.json();
    console.log('Video status:', status.status);

    if (status.status === 'Completed' && status.videoUrl) {
      return status.videoUrl;
    } else if (status.status === 'failed') {
      throw new Error(status.errorMessage || 'Video generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before next check
  }

  throw new Error('Video generation timed out');
}

export const generateVideo = functions.firestore
  .document('quiz_results/{userId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const quizData = snap.data() as QuizResultData;
    const userId = context.params.userId;
    
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
  }); 