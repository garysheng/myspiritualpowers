'use client';

import { Share2, Mail, Link2, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface ShareMenuProps {
  userId: string;
  spiritualArchetype: string;
}

export function ShareMenu({ userId, spiritualArchetype }: ShareMenuProps) {
  const { toast } = useToast();
  const shareUrl = `https://myspiritualpowers.com/results/${userId}`;
  const shareTitle = `I discovered my Spiritual Power Archetype: ${spiritualArchetype}`;
  const shareText = `Take this insightful spiritual gifts assessment to discover your unique spiritual powers and divine purpose.`;

  const handleShare = async (platform: string) => {
    trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform });

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
        const emailSubject = encodeURIComponent(shareTitle);
        const emailBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;

      case 'x':
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `${shareTitle}\n\n${shareText}\n\n${shareUrl}`
        )}`;
        window.open(xUrl, '_blank');
        break;

      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        window.open(facebookUrl, '_blank');
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleShare('copy')} className="gap-2">
          <Link2 className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')} className="gap-2">
          <Mail className="h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleShare('x')} className="gap-2">
          <Twitter className="h-4 w-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2">
          <Facebook className="h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 