'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Loader2, Play } from 'lucide-react';

export default function VideoDevPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateVideo = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`https://us-central1-myspiritualpowers-6cc8d.cloudfunctions.net/generateVideoManual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: "Video generation started",
        description: "Check the video player on your results page.",
      });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Generation Dev Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Current User</h3>
              <p className="text-sm text-muted-foreground">
                {user ? `${user.displayName} (${user.uid})` : 'Not logged in'}
              </p>
            </div>

            <Button
              onClick={handleGenerateVideo}
              disabled={!user || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 