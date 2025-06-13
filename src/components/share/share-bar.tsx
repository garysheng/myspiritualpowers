'use client';

import { useState } from 'react';
import { Mail, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { EmailInviteDialog } from './email-invite-dialog';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface ShareBarProps {
  userId: string;
}

export function ShareBar({ userId }: ShareBarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const shareUrl = `https://myspiritualpowers.com/results/${userId}`;
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);



  const handleShare = async (platform: string) => {
    try {
      await trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform });

      switch (platform) {
        case 'copy':
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast({
              title: "Link copied!",
              description: "Share link has been copied to your clipboard.",
              duration: 3000,
            });
          } catch (err) {
            console.error('Failed to copy URL:', err);
            toast({
              title: "Failed to copy link",
              description: "Please try again or use another sharing method.",
              variant: "destructive",
              duration: 3000,
            });
          }
          break;

        case 'email':
          setEmailDialogOpen(true);
          break;
      }
    } catch (error) {
      console.error('Error tracking share event:', error);
    }
  };



  // If not logged in, show CTA
  if (!user) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm z-50 pb-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex flex-col gap-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                Discover Your Spiritual Powers
              </h3>
              <p className="text-sm text-muted-foreground">
                Take the quiz to uncover your unique spiritual gifts and divine purpose
              </p>
            </div>

            <Link href="/quiz" className="block">
              <Button 
                size="lg"
                className="w-full relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Take the Quiz
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <EmailInviteDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />



      {/* Share Bar UI */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Share Your Spiritual Powers</h3>
              <p className="text-sm text-muted-foreground">
                Help others discover their spiritual gifts by sharing your results
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={() => handleShare('copy')}
              >
                <Link2 className="h-4 w-4" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={() => handleShare('email')}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 