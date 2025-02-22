'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuizResultBackend, SpiritualGift } from '@/types';
import { calculateGiftScores, GIFT_DESCRIPTIONS } from '@/data/spiritual-gifts-questions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { ShareBar } from '@/components/share/share-bar';
import { FloatingRating } from '@/components/rating/floating-rating';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { Sparkles, Zap, Brain, Target, Book, GraduationCap, Compass, Image, Mail } from 'lucide-react';
import NextImage from 'next/image';
import { SharePreview } from '@/components/share/share-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';;
import { VideoPlayer } from '@/components/video/video-player';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function ResultsPage() {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResultBackend | null>(null);
  const [spiritualGifts, setSpiritualGifts] = useState<SpiritualGift[]>([]);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        if (authLoading) return;

        const resultDoc = await getDoc(doc(db, 'quiz_results', userId as string));

        if (!resultDoc.exists()) {
          setError('Results not found');
          setLoading(false);
          return;
        }

        const resultData = resultDoc.data() as QuizResultBackend;

        // If this is the current user's results and they're logged in,
        // use their current Firebase Auth data for display name and photo
        const shouldUseAuthData = user && user.uid === userId;
        const finalResultData = {
          ...resultData,
          displayName: shouldUseAuthData && user.displayName ? user.displayName : resultData.displayName,
          photoURL: shouldUseAuthData && user.photoURL ? user.photoURL : resultData.photoURL,
        };

        setResults(finalResultData);
        setHasRated(!!resultData.rating); // Check if user has already rated

        // Convert responses array to Record<string, number>
        const responseRecord: Record<string, number> = {};
        finalResultData.responses.forEach(response => {
          responseRecord[response.questionId] = parseInt(response.selectedOptionId);
        });

        // Calculate gift scores
        const scores = calculateGiftScores(responseRecord);

        // Sort gifts by score and take top 5
        const sortedGifts = Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([gift, score]) => ({
            ...GIFT_DESCRIPTIONS[gift.toLowerCase()],
            strength: Math.round((score / 15) * 100), // Max score per gift is 15 (5 questions × 3 points)
          }));

        setSpiritualGifts(sortedGifts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Error loading results');
        setLoading(false);
      }
    }

    fetchResults();
  }, [userId, authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100svh-4rem)] p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] p-4 pb-40">
      {/* Show rating component only if this is the user's own results and they haven't rated yet */}
      {user && user.uid === userId && !hasRated && (
        <FloatingRating
          userId={userId as string}
          onRated={() => setHasRated(true)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Section */}
        {results && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {results.photoURL && (
              <NextImage
                src={results.photoURL}
                alt={`${results.displayName}'s profile picture`}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Spiritual Powers Quiz Results for {results.displayName}
            </h1>
          </div>
        )}

        {/* Spiritual Archetype Card */}
        {results?.spiritualArchetype && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
            <CardHeader className="flex flex-col items-center justify-center">
              <CardTitle className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                  <h1 className="text-lg text-white/90">
                    Your Spiritual Power Archetype
                  </h1>
                </div>

                <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-400 via-primary to-indigo-400 bg-clip-text text-transparent pb-3">
                  {results.spiritualArchetype.name}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative">
              <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm">
                <p className="text-lg leading-relaxed">
                  {results.spiritualArchetype.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    Biblical Example
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {results.spiritualArchetype.biblicalExample.detailed}
                  </p>
                </div>
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Modern Application
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {results.spiritualArchetype.modernApplication.detailed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Section */}
        {userId && (
          <VideoPlayer userId={userId as string} />
        )}

        {/* Spiritual Gifts Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-violet-400" />
              <span className="text-4xl text-center font-bold bg-gradient-to-r from-violet-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                Your Top Spiritual Powers
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative">
            {spiritualGifts.map((gift, index) => (
              <div key={index} className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                        {gift.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold">{gift.strength}%</span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${gift.strength >= 80 ? 'bg-violet-500/10 text-violet-400' :
                            gift.strength >= 70 ? 'bg-blue-500/10 text-blue-400' :
                              gift.strength >= 60 ? 'bg-cyan-500/10 text-cyan-400' :
                                gift.strength >= 50 ? 'bg-emerald-500/10 text-emerald-400' :
                                  'bg-slate-500/10 text-slate-400'
                          }`}>
                          {gift.strength >= 80 ? 'Exceptional' :
                            gift.strength >= 70 ? 'Strong' :
                              gift.strength >= 60 ? 'Proficient' :
                                gift.strength >= 50 ? 'Developing' :
                                  'Emerging'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Rank #{index + 1} Power
                    </p>
                  </div>
                </div>

                <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${gift.strength >= 80 ? 'bg-gradient-to-r from-violet-500 via-primary to-indigo-500' :
                        gift.strength >= 70 ? 'bg-gradient-to-r from-blue-500 via-primary to-cyan-500' :
                          gift.strength >= 60 ? 'bg-gradient-to-r from-cyan-500 via-primary to-blue-500' :
                            gift.strength >= 50 ? 'bg-gradient-to-r from-emerald-500 via-primary to-teal-500' :
                              'bg-gradient-to-r from-slate-500 via-primary to-gray-500'
                      }`}
                    style={{
                      width: `${gift.strength}%`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  />
                </div>

                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p className="text-base leading-relaxed">
                    {gift.description || 'Description coming soon...'}
                  </p>
                </div>

                {gift.biblicalReferences && gift.biblicalReferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="w-full text-sm font-medium text-muted-foreground mb-1">
                      Biblical References:
                    </div>
                    {gift.biblicalReferences.map((reference, i) => (
                      <a
                        key={i}
                        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackEvent(AnalyticsEvents.BIBLE_REFERENCE_CLICKED, { reference });
                        }}
                      >
                        {reference}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Personalized Insights Card */}
        {results?.personalizedInsights && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-violet-400" />
                <span className="text-4xl text-center font-bold bg-gradient-to-r from-violet-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                  Personalized Insights
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative">
              <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-400" />
                  Summary
                </h3>
                <p className="text-lg leading-relaxed">
                  {results.personalizedInsights.summary}
                </p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Book className="w-5 h-5 text-violet-400" />
                  Strengths & Areas for Growth
                </h3>
                <p className="text-lg leading-relaxed">
                  {results.personalizedInsights.strengthsAndWeaknesses}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-violet-400" />
                    Recommended Ministries
                  </h3>
                  <ul className="space-y-2 text-lg">
                    {results.personalizedInsights.recommendedMinistries.map((ministry, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-violet-400/80">•</span>
                        <span className="text-muted-foreground">{ministry}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-violet-400" />
                    Growth Areas
                  </h3>
                  <ul className="space-y-2 text-lg">
                    {results.personalizedInsights.growthAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-violet-400/80">•</span>
                        <span className="text-muted-foreground">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Images Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Image className="w-6 h-6 text-violet-400" />
              <span className="text-4xl text-center font-bold bg-gradient-to-r from-violet-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                Your Share Image
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative">
            <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-3">
              <div className="aspect-square w-full bg-black/40 rounded-lg overflow-hidden">
                {results && (
                  <SharePreview
                    userId={userId as string}
                    dimension="square"
                    displayName={results.displayName}
                  />
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 gap-2"
                  onClick={async () => {
                    if (!results) return;
                    try {
                      const imageRef = ref(storage, `share_images/${userId}/square.png`);
                      const url = await getDownloadURL(imageRef);
                      
                      // Open in new tab
                      window.open(url, '_blank');
                      
                      trackEvent(AnalyticsEvents.RESULTS_DOWNLOADED);
                      
                      toast({
                        title: "Image opened!",
                        description: "Right click and save to download.",
                        duration: 3000,
                      });
                    } catch (error) {
                      console.error('Error opening image:', error);
                      toast({
                        title: "Failed to open image",
                        description: "Please try again later.",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                >
                  <Image className="w-4 h-4" />
                  Open Image
                </Button>
                <Button
                  className="flex-1 gap-2"
                  variant="secondary"
                  onClick={async () => {
                    if (!results) return;

                    try {
                      const imageRef = ref(storage, `share_images/${userId}/square.png`);
                      const url = await getDownloadURL(imageRef);
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const file = new File([blob], 'spiritual-powers.png', { type: 'image/png' });

                      const shareData = {
                        title: 'Discover Your Spiritual Powers',
                        text: `Hey! I just discovered my spiritual power archetype - I'm a ${results.spiritualArchetype.name}! 🌟 Take this insightful quiz to discover yours:`,
                        url: `https://myspiritualpowers.com/results/${userId}`,
                        files: [file]
                      };

                      if (navigator.canShare && navigator.canShare(shareData)) {
                        trackEvent(AnalyticsEvents.RESULTS_SHARED, { platform: 'native_share' });
                        await navigator.share(shareData);
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
                  <Mail className="w-4 h-4" />
                  Share via Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Bar */}
      {results && (
        <ShareBar
          userId={userId as string}
          spiritualArchetype={results.spiritualArchetype.name}
          spiritualGifts={spiritualGifts}
          displayName={results.displayName}
          photoURL={results.photoURL}
          biblicalExample={results.spiritualArchetype.biblicalExample}
          modernApplication={results.spiritualArchetype.modernApplication}
        />
      )}
    </div>
  );
} 