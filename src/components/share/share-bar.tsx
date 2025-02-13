'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, Link2, Image as ImageIcon, Loader2, Share, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import html2canvas from 'html2canvas';
import { EmailInviteDialog } from './email-invite-dialog';
import { getCachedImage, setCachedImage } from '@/lib/image-cache';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface ShareBarProps {
  userId: string;
  spiritualArchetype: string;
  spiritualGifts: Array<{
    name: string;
    strength: number;
  }>;
  displayName?: string;
  photoURL?: string;
  biblicalExample?: string;
  modernApplication?: string;
}

export function ShareBar({ userId, spiritualArchetype, spiritualGifts, displayName, photoURL, biblicalExample, modernApplication }: ShareBarProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const shareUrl = `https://myspiritualpowers.com/results/${userId}`;
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Auto-generate images on mount
  useEffect(() => {
    const generateAndCacheImages = async () => {
      if (!imageRef.current) return;

      try {
        const cached = await getCachedImage(userId, 'square');
        if (cached?.url) {
          // Already cached in Firebase Storage
          return;
        }

        const canvas = await html2canvas(imageRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 0,
        });

        const dataUrl = canvas.toDataURL('image/png');
        await setCachedImage(userId, {
          dataUrl,
          dimension: 'square',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error generating image:', error);
      }
    };

    generateAndCacheImages();
  }, [userId]);

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

  const handleGenerateImage = async () => {
    if (!imageRef.current) return;

    setIsGenerating(true);
    try {
      await trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform: 'image' });

      // Use cached image if available
      const cached = await getCachedImage(userId, 'square');
      if (cached?.url) {
        // Download the cached image from Firebase Storage
        const response = await fetch(cached.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Download the image
        const a = document.createElement('a');
        a.href = url;
        a.download = `spiritual-powers-square.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Image downloaded!",
          description: "Your shareable image has been downloaded.",
          duration: 3000,
        });
        return;
      }

      // Generate new image if not cached
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
      });

      const dataUrl = canvas.toDataURL('image/png');
      await setCachedImage(userId, {
        dataUrl,
        dimension: 'square',
        timestamp: Date.now()
      });

      // Download the image
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `spiritual-powers-square.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Image downloaded!",
        description: "Your shareable image has been downloaded.",
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to generate image:', err);
      toast({
        title: "Failed to generate image",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
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

      {/* Hidden template for image generation */}
      <div className="fixed -left-[9999px]" ref={imageRef}>
        <div
          style={{
            width: '1080px',
            height: '1080px',
            background: 'linear-gradient(135deg, rgb(15 15 15), rgb(30 30 30))',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow effects */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15), transparent 70%)',
            transform: 'rotate(-45deg)',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: '100%',
            zIndex: 1,
          }}>
            {/* User Profile Section */}
            <div
              data-profile-section
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                gap: '20px',
                marginTop: '-20px',
              }}
            >
              {photoURL && (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <img
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(photoURL)}&n=-1&w=200&h=200`}
                    alt={`${displayName || 'User'}'s profile picture`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}
              {displayName && (
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#e5e7eb',
                  letterSpacing: '0.05em',
                  paddingBottom: '25px',
                }}>
                  {displayName}
                </div>
              )}
            </div>

            <div style={{
              fontSize: '24px',
              color: '#a78bfa',
              marginBottom: '12px',
              opacity: 0.9,
              maxWidth: '90%',
              margin: '0 auto',
              textAlign: 'center',
            }}>
              My Spiritual Power Archetype
            </div>

            <div style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              padding: '24px 24px 64px 24px',
              width: '100%',
              marginBottom: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px',
              maxWidth: '90%',
              margin: '0 auto',
              lineHeight: '1.2',
            }}>
              {spiritualArchetype}
            </div>

            {/* Two Column Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              width: '100%',
              marginBottom: '40px',
            }}>
              {/* Left Column - Spiritual Gifts */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingLeft: '12px',
              }}>
                <div style={{
                  fontSize: '28px',
                  color: '#a78bfa',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}>
                  My Top Powers
                </div>
                {spiritualGifts.slice(0, 5).map((gift, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                  }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#a78bfa',
                      width: '30px',
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      fontSize: '38px',
                      fontWeight: 'bold',
                      color: '#e5e7eb',
                    }}>
                      {gift.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Biblical Example */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {/* Biblical Example Box */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: 'fit-content',
                }}>
                  <div style={{
                    fontSize: '22px',
                    color: '#a78bfa',
                    fontWeight: 'bold',
                  }}>
                    Biblical Example
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#e5e7eb',
                    lineHeight: '1.6',
                    textAlign: 'left',
                  }}>
                    {biblicalExample}
                  </div>
                </div>

                {/* Modern Application Box */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: 'fit-content',
                }}>
                  <div style={{
                    fontSize: '22px',
                    color: '#a78bfa',
                    fontWeight: 'bold',
                  }}>
                    Modern Application
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#e5e7eb',
                    lineHeight: '1.6',
                    textAlign: 'left',
                  }}>
                    {modernApplication}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 'auto',
            marginBottom: '20px',
            zIndex: 1,
            paddingTop: '20px',
          }}>
            <div style={{
              fontSize: '20px',
              color: '#9ca3af',
              opacity: 0.8,
              marginBottom: '8px',
            }}>
              Discover your spiritual gifts at
            </div>
            <div style={{
              fontSize: '24px',
              color: '#a78bfa',
              fontWeight: 'bold',
            }}>
              myspiritualpowers.com
            </div>
          </div>
        </div>
      </div>

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

            <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2">
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
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={handleGenerateImage}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Download Image
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={async () => {
                  try {
                    const cached = await getCachedImage(userId, 'square');
                    if (!cached?.url) {
                      toast({
                        title: "Image not ready",
                        description: "Please try again in a moment.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const response = await fetch(cached.url);
                    if (!response.ok) {
                      throw new Error('Failed to fetch image');
                    }

                    const blob = await response.blob();
                    const file = new File([blob], 'spiritual-powers.png', { type: 'image/png' });

                    const shareData = {
                      title: 'Discover Your Spiritual Powers',
                      text: `Hey! I just discovered my spiritual power archetype - I'm a ${spiritualArchetype}! 🌟 Take this insightful quiz to discover yours:`,
                      url: `https://myspiritualpowers.com/results/${userId}`,
                      files: [file]
                    };

                    if (navigator.canShare && navigator.canShare(shareData)) {
                      await trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform: 'native_share' });
                      await navigator.share(shareData);

                      toast({
                        title: "Success!",
                        description: "Your spiritual powers have been shared.",
                      });
                    } else {
                      toast({
                        title: "Sharing not supported",
                        description: "Your device doesn't support direct sharing. Try downloading and sharing manually.",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error('Error sharing:', error);
                    if ((error as Error)?.name !== 'AbortError') {
                      toast({
                        title: "Error sharing",
                        description: "There was an error sharing your image. Try downloading and sharing manually.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
              >
                <Share className="h-4 w-4" />
                Share Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 