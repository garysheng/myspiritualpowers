'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Play } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { redirect } from 'next/navigation';

interface VideoGeneration {
  status: 'pending' | 'audio_generated' | 'video_generated' | 'complete' | 'error';
  error?: string;
  videoUrl?: string;
}

export default function VideoDevPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoGeneration | null>(null);

  // Redirect if not authenticated
  if (!loading && !user) {
    redirect('/login');
  }

  // Listen to video generation status
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'video_generations', user.uid),
      (doc) => {
        if (doc.exists()) {
          setVideoStatus(doc.data() as VideoGeneration);
        }
      },
      (error) => {
        console.error('Error fetching video status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load video status',
          variant: 'destructive'
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleGenerateVideo = async () => {
    if (!user) return;

    setIsGenerating(true);
    const functions = getFunctions();
    const generateVideo = httpsCallable(functions, 'generateVideoManual2');

    try {
      await generateVideo({ userId: user.uid });
      toast({
        title: 'Success',
        description: 'Video generation started!'
      });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate video',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Video Generation Test</h1>
          <p className="text-muted-foreground">Generate and test personalized videos</p>
        </div>
        <Button 
          onClick={handleGenerateVideo} 
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">Current Status</h3>
                <p className="text-sm text-muted-foreground">
                  {videoStatus ? (
                    videoStatus.status === 'error' ? (
                      <span className="text-red-500">Error: {videoStatus.error}</span>
                    ) : (
                      <span className="capitalize">{videoStatus.status.replace('_', ' ')}</span>
                    )
                  ) : (
                    'No video generation in progress'
                  )}
                </p>
              </div>
            </div>

            {videoStatus?.videoUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <video 
                  src={videoStatus.videoUrl} 
                  controls 
                  className="w-full h-full"
                  poster="/video-poster.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 