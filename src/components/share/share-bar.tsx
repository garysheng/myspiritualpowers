'use client';

import { useState, useRef } from 'react';
import { Mail, Link2, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import html2canvas from 'html2canvas';

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

type ImageDimensions = 'square' | 'tall';

export function ShareBar({ userId, spiritualArchetype, spiritualGifts, displayName, photoURL, biblicalExample, modernApplication }: ShareBarProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<ImageDimensions>('square');
  const imageRef = useRef<HTMLDivElement>(null);
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
    }
  };

  const handleGenerateImage = async () => {
    if (!imageRef.current) return;

    setIsGenerating(true);
    trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform: 'image', dimension: selectedDimension });

    try {
      // Pre-load profile image if it exists
      let profileImageLoaded = false;
      if (photoURL) {
        try {
          // Try loading through imgproxy with better options
          const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(photoURL)}&n=-1&w=200&h=200`;
          await new Promise<void>((resolve, reject) => {
            const img = document.createElement('img');
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              profileImageLoaded = true;
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to load profile image through proxy');
              resolve(); // Resolve anyway to continue without profile pic
            };
            img.src = proxyUrl;
          });
        } catch (e) {
          console.warn('Error pre-loading profile image:', e);
        }
      }

      // Update image template based on profile image status
      if (!profileImageLoaded && imageRef.current) {
        const profileSection = imageRef.current.querySelector('[data-profile-section]');
        if (profileSection) {
          profileSection.remove();
        }
      }

      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: null,
        scale: 2, // Render at 2x for better quality
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow cross-origin images
        logging: true, // Enable logging for debugging
        imageTimeout: 0, // Disable timeout for image loading
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      // Download the image
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spiritual-powers-${selectedDimension}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Image generated!",
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

  return (
    <>
      {/* Hidden template for image generation */}
      <div className="fixed -left-[9999px]" ref={imageRef}>
        <div 
          style={{
            width: '1080px',
            height: selectedDimension === 'square' ? '1080px' : '1920px',
            background: 'linear-gradient(135deg, rgb(15 15 15), rgb(30 30 30))',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: selectedDimension === 'square' ? '60px' : '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: selectedDimension === 'square' ? 'space-between' : 'center',
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
            ...(selectedDimension === 'tall' && { 
              position: 'relative',
              top: '-5%'
            })
          }}>
            {/* User Profile Section */}
            <div 
              data-profile-section
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: selectedDimension === 'square' ? '16px' : '24px',
                gap: '20px',
                marginTop: selectedDimension === 'square' ? '0' : '24px',
              }}
            >
              {photoURL && (
                <div style={{
                  width: selectedDimension === 'square' ? '64px' : '80px',
                  height: selectedDimension === 'square' ? '64px' : '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #a78bfa',
                }}>
                  <img 
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(photoURL)}&n=-1&w=200&h=200`}
                    alt="Profile" 
                    crossOrigin="anonymous"
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
                  fontSize: selectedDimension === 'square' ? '28px' : '36px',
                  fontWeight: 'bold',
                  color: '#e5e7eb',
                  letterSpacing: '0.05em',
                }}>
                  {displayName}
                </div>
              )}
            </div>

            <div style={{
              fontSize: selectedDimension === 'square' ? '24px' : '28px',
              color: '#a78bfa',
              marginBottom: selectedDimension === 'square' ? '12px' : '16px',
              opacity: 0.9,
              maxWidth: '90%',
              margin: '0 auto',
            }}>
              My Spiritual Power Archetype
            </div>
            
            <div style={{
              fontSize: selectedDimension === 'square' ? '56px' : '64px',
              fontWeight: 'bold',
              color: 'white',
              padding: selectedDimension === 'square' ? '24px' : '32px',
              width: '100%',
              marginBottom: selectedDimension === 'square' ? '32px' : '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: selectedDimension === 'square' ? '120px' : '160px',
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
              gap: selectedDimension === 'square' ? '40px' : '50px',
              width: '100%',
            }}>
              {/* Left Column - Spiritual Gifts */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: selectedDimension === 'square' ? '16px' : '24px',
                paddingLeft: '12px',
              }}>
                <div style={{
                  fontSize: selectedDimension === 'square' ? '28px' : '32px',
                  color: '#a78bfa',
                  fontWeight: 'bold',
                  marginBottom: selectedDimension === 'square' ? '16px' : '24px',
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
                      fontSize: selectedDimension === 'square' ? '28px' : '32px',
                      fontWeight: 'bold',
                      color: '#a78bfa',
                      width: '30px',
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      fontSize: selectedDimension === 'square' ? '38px' : '48px',
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
                  padding: selectedDimension === 'square' ? '32px' : '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: 'fit-content',
                }}>
                  <div style={{
                    fontSize: selectedDimension === 'square' ? '22px' : '26px',
                    color: '#a78bfa',
                    fontWeight: 'bold',
                  }}>
                    Biblical Example
                  </div>
                  <div style={{
                    fontSize: selectedDimension === 'square' ? '18px' : '22px',
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
                  padding: selectedDimension === 'square' ? '32px' : '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: 'fit-content',
                }}>
                  <div style={{
                    fontSize: selectedDimension === 'square' ? '22px' : '26px',
                    color: '#a78bfa',
                    fontWeight: 'bold',
                  }}>
                    Modern Application
                  </div>
                  <div style={{
                    fontSize: selectedDimension === 'square' ? '18px' : '22px',
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
            marginTop: selectedDimension === 'square' ? '60px' : 'auto',
            marginBottom: selectedDimension === 'tall' ? '0' : '0',
            zIndex: 1,
            ...(selectedDimension === 'tall' && {
              position: 'absolute',
              bottom: '200px',
              left: '0',
              right: '0'
            })
          }}>
            <div style={{
              fontSize: selectedDimension === 'square' ? '20px' : '24px',
              color: '#9ca3af',
              opacity: 0.8,
            }}>
              Discover your spiritual gifts at
            </div>
            <div style={{
              fontSize: selectedDimension === 'square' ? '24px' : '28px',
              color: '#a78bfa',
              fontWeight: 'bold',
              marginTop: '8px',
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
            
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none gap-2" 
                onClick={() => handleShare('copy')}
              >
                <Link2 className="h-4 w-4" />
                Copy Link
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none gap-2" 
                onClick={() => handleShare('email')}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Generate Graphic
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Shareable Graphic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Choose Dimensions</Label>
                      <RadioGroup 
                        defaultValue="square" 
                        className="grid grid-cols-2 gap-4"
                        onValueChange={(value) => setSelectedDimension(value as ImageDimensions)}
                      >
                        <div>
                          <RadioGroupItem 
                            value="square" 
                            id="square" 
                            className="peer sr-only" 
                          />
                          <Label
                            htmlFor="square"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <div className="w-16 h-16 mb-2 border-2 border-current rounded" />
                            Square
                            <span className="text-xs text-muted-foreground">1080 × 1080</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem 
                            value="tall" 
                            id="tall" 
                            className="peer sr-only" 
                          />
                          <Label
                            htmlFor="tall"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <div className="w-12 h-16 mb-2 border-2 border-current rounded" />
                            Story
                            <span className="text-xs text-muted-foreground">1080 × 1920</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Image'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 