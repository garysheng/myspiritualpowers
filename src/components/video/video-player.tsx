import { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VideoGenerationData {
  userId: string;
  script: string;
  status: 'pending' | 'audio_generated' | 'video_generated' | 'complete' | 'error';
  audioUrl?: string;
  videoUrl?: string;
  error?: string;
}

interface VideoPlayerProps {
  userId: string;
}

export function VideoPlayer({ userId }: VideoPlayerProps) {
  const [videoData, setVideoData] = useState<VideoGenerationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'video_generations', userId),
      (doc) => {
        if (doc.exists()) {
          setVideoData(doc.data() as VideoGenerationData);
        } else {
          setError('Video generation not found');
        }
      },
      (err) => {
        console.error('Error fetching video:', err);
        setError('Error loading video');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleGenerateVideo = async () => {
    try {
      setIsGenerating(true);
      
      // Get the quiz result to get the script
      const quizDoc = await getDoc(doc(db, 'quiz_results', userId));
      if (!quizDoc.exists()) {
        throw new Error('Quiz results not found');
      }

      const quizData = quizDoc.data();
      if (!quizData.videoScript?.script) {
        throw new Error('Video script not found in quiz results');
      }

      // Create video generation document
      const videoData: VideoGenerationData = {
        userId,
        script: quizData.videoScript.script,
        status: 'pending',
      };

      await setDoc(doc(db, 'video_generations', userId), videoData);

      toast({
        title: 'Video generation started',
        description: 'Your video will be ready in a few minutes.',
      });
    } catch (err) {
      console.error('Error starting video generation:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to start video generation',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleGenerateVideo}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting video generation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Generate Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!videoData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Loading video...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (videoData.status) {
    case 'pending':
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Preparing to generate video...</p>
            </div>
          </CardContent>
        </Card>
      );

    case 'audio_generated':
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Generating video with AI...</p>
            </div>
          </CardContent>
        </Card>
      );

    case 'complete':
      if (!videoData.videoUrl) {
        return (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>Video URL not found</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleGenerateVideo}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting video generation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <video
                src={videoData.videoUrl}
                controls
                className="w-full h-full"
                poster="/video-poster.jpg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      );

    case 'error':
      return (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{videoData.error || 'Error generating video'}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleGenerateVideo}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting video generation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
} 