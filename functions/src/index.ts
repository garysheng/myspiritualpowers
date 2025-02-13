import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { ElevenLabsClient } from 'elevenlabs';
import fetch from 'node-fetch';
import { defineSecret } from 'firebase-functions/params';
import FormData from 'form-data';

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
const REFERENCE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/myspiritualpowers-6cc8d.firebasestorage.app/o/reference_faces%2F1.png?alt=media&token=08c96d2d-bbb9-4d9b-8a97-62861d525400';

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
  console.log('Starting video generation with Hedra');

  try {
    // 1. Upload audio to Hedra
    console.log('Uploading audio to Hedra');
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio from Firebase Storage');
    }
    const audioBuffer = await audioResponse.arrayBuffer();

    const audioFormData = new FormData();
    audioFormData.append('file', Buffer.from(audioBuffer), {
      filename: 'audio.mp3',
      contentType: 'audio/mp3'
    });

    const hedraAudioResponse = await fetch(`${HEDRA_BASE_URL}/v1/audio`, {
      method: 'POST',
      headers: {
        'X-API-KEY': hedraApiKey.value(),
        ...audioFormData.getHeaders()
      },
      body: audioFormData
    });

    if (!hedraAudioResponse.ok) {
      const errorText = await hedraAudioResponse.text();
      console.error('Hedra audio upload failed:', {
        status: hedraAudioResponse.status,
        statusText: hedraAudioResponse.statusText,
        error: errorText
      });
      throw new Error(`Hedra audio upload failed: ${errorText}`);
    }

    const audioJson = await hedraAudioResponse.json();
    const { url: audioUrlFromHedra } = audioJson;
    console.log('Successfully uploaded audio to Hedra', { audioUrl: audioUrlFromHedra });

    // 2. Upload reference image to Hedra
    console.log('Uploading reference image to Hedra');
    const imageResponse = await fetch(REFERENCE_IMAGE_URL);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch reference image');
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    const imageFormData = new FormData();
    imageFormData.append('file', Buffer.from(imageBuffer), {
      filename: 'portrait.png',
      contentType: 'image/png'
    });

    const portraitUploadResponse = await fetch(`${HEDRA_BASE_URL}/v1/portrait?aspect_ratio=16:9`, {
      method: 'POST',
      headers: {
        'X-API-KEY': hedraApiKey.value(),
        ...imageFormData.getHeaders()
      },
      body: imageFormData
    });

    if (!portraitUploadResponse.ok) {
      const errorText = await portraitUploadResponse.text();
      console.error('Hedra portrait upload failed:', {
        status: portraitUploadResponse.status,
        statusText: portraitUploadResponse.statusText,
        error: errorText
      });
      throw new Error(`Hedra portrait upload failed: ${errorText}`);
    }

    const portraitJson = await portraitUploadResponse.json();
    const { url: portraitUrlFromHedra } = portraitJson;
    console.log('Successfully uploaded portrait to Hedra', { portraitUrl: portraitUrlFromHedra });

    // 3. Generate video
    console.log('Initiating video generation');
    const videoResponse = await fetch(`${HEDRA_BASE_URL}/v1/characters`, {
      method: 'POST',
      headers: {
        'X-API-KEY': hedraApiKey.value(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatarImage: portraitUrlFromHedra,
        audioSource: "audio",
        voiceUrl: audioUrlFromHedra,
        aspectRatio: "16:9",
        text: "",
        voiceId: null
      })
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error('Hedra video generation request failed:', {
        status: videoResponse.status,
        statusText: videoResponse.statusText,
        error: errorText
      });
      throw new Error(`Hedra video generation failed: ${errorText}`);
    }

    const videoJson = await videoResponse.json();
    const { jobId } = videoJson;
    console.log('Video generation initiated', { jobId });

    // 4. Poll for completion
    for (let i = 0; i < 48; i++) {
      console.log(`Checking video status (attempt ${i + 1}/48)`);

      const statusResponse = await fetch(`${HEDRA_BASE_URL}/v1/projects/${jobId}`, {
        headers: { 'X-API-KEY': hedraApiKey.value() }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Failed to check video status:', {
          jobId,
          status: statusResponse.status,
          statusText: statusResponse.statusText,
          error: errorText
        });
        throw new Error(`Failed to check video status: ${errorText}`);
      }

      const status = await statusResponse.json();
      console.log('Video status:', status);

      if (status.status === 'Completed' && status.videoUrl) {
        console.log('Video generation completed', { videoUrl: status.videoUrl });
        return status.videoUrl;
      }

      if (status.status === 'failed' || status.errorMessage) {
        console.error('Video generation failed:', {
          jobId,
          error: status.errorMessage || 'No error details provided'
        });
        throw new Error(`Video generation failed: ${status.errorMessage || 'Unknown error'}`);
      }

      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error('Video generation timed out');
  } catch (error) {
    console.error('Error in video generation:', error);
    throw error;
  }
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

// Manual video generation function
export const generateVideoManual2 = onCall(
  {
    enforceAppCheck: false,
    secrets: [elevenlabsApiKey, hedraApiKey],
    timeoutSeconds: 540,
  },
  async (request) => {
    // Verify auth
    if (!request.auth) {
      throw new Error('Unauthorized');
    }

    const userId = request.data.userId;
    if (!userId) {
      throw new Error('Missing userId in request data');
    }

    console.log('Manual video generation triggered for user:', userId);

    try {
      // Get the quiz result document
      const quizDoc = await admin.firestore().collection('quiz_results').doc(userId).get();

      if (!quizDoc.exists) {
        throw new Error('Quiz results not found');
      }

      const quizData = quizDoc.data() as QuizResultData;

      // Create a document to track video generation progress
      const videoRef = admin.firestore().collection('video_generations').doc(userId);

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

      // Upload audio to Firebase Storage using Admin SDK
      const bucket = admin.storage().bucket();
      const audioFileName = `video_generations/${userId}/audio.mp3`;
      const audioFile = bucket.file(audioFileName);

      await audioFile.save(audioBuffer, {
        metadata: {
          contentType: 'audio/mpeg',
        },
      });

      // Get a signed URL that expires in 1 hour
      const [audioUrl] = await audioFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
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

        // Upload to Firebase Storage using Admin SDK
        const videoFileName = `video_generations/${userId}/video.mp4`;
        const videoFile = bucket.file(videoFileName);

        await videoFile.save(videoBuffer, {
          metadata: {
            contentType: 'video/mp4',
          },
        });

        // Get a signed URL that expires in 1 week
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

        return { success: true, videoUrl };
      } catch (videoError) {
        console.error('Error generating video:', videoError);
        await videoRef.update({
          status: 'error',
          error: videoError instanceof Error ? videoError.message : 'Video generation failed',
          updatedAt: admin.firestore.Timestamp.now(),
        });
        throw videoError;
      }
    } catch (error: unknown) {
      console.error('Error in video generation process:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }
); 