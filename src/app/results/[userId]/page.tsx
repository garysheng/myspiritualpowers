'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuizResultBackend, SpiritualGift } from '@/types';
import { calculateGiftScores, GIFT_DESCRIPTIONS } from '@/data/spiritual-gifts-questions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

export default function ResultsPage() {
  const { userId } = useParams();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResultBackend | null>(null);
  const [spiritualGifts, setSpiritualGifts] = useState<SpiritualGift[]>([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        if (authLoading) return;
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Only allow users to view their own results
        if (user.uid !== userId) {
          setError('You can only view your own results');
          setLoading(false);
          return;
        }

        const resultDoc = await getDoc(doc(db, 'quiz_results', userId as string));
        
        if (!resultDoc.exists()) {
          setError('Results not found');
          setLoading(false);
          return;
        }

        const resultData = resultDoc.data() as QuizResultBackend;
        setResults(resultData);

        console.log('Raw result data:', resultData);
        console.log('Responses:', resultData.responses);

        // Convert responses array to Record<string, number>
        const responseRecord: Record<string, number> = {};
        resultData.responses.forEach(response => {
          responseRecord[response.questionId] = parseInt(response.selectedOptionId);
        });

        console.log('Response record:', responseRecord);

        // Calculate gift scores
        const scores = calculateGiftScores(responseRecord);
        
        console.log('Gift scores:', scores);
        
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
  }, [userId, user, authLoading]);

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

  if (!user) {
    return (
      <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Sign in to View Results</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={signInWithGoogle} size="lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
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
    <div className="min-h-[calc(100svh-4rem)] p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Spiritual Archetype Card */}
        {results?.spiritualArchetype && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
            <CardHeader>
              <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
                Your Spiritual Power Archetype
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative">
              <div className="text-3xl font-bold text-center bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                {results.spiritualArchetype.name}
              </div>
              
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
                    {results.spiritualArchetype.biblicalExample}
                  </p>
                </div>
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Modern Application
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {results.spiritualArchetype.modernApplication}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spiritual Gifts Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-violet-500/10" />
          <CardHeader>
            <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-indigo-500 via-primary to-violet-500 bg-clip-text text-transparent">
              Your Top Spiritual Powers
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
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          gift.strength >= 80 ? 'bg-violet-500/10 text-violet-400' :
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
                    className={`h-full rounded-full transition-all duration-500 ${
                      gift.strength >= 80 ? 'bg-gradient-to-r from-violet-500 via-primary to-indigo-500' :
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gift.biblicalReferences.map((reference, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary-foreground/80"
                      >
                        {reference}
                      </span>
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-primary/5 to-cyan-500/10" />
            <CardHeader>
              <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-blue-500 via-primary to-cyan-500 bg-clip-text text-transparent">
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 relative">
              <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Summary
                </h3>
                <p className="text-lg leading-relaxed">
                  {results.personalizedInsights.summary}
                </p>
              </div>
              
              <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  Strengths & Areas for Growth
                </h3>
                <p className="text-lg leading-relaxed">
                  {results.personalizedInsights.strengthsAndWeaknesses}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Recommended Ministries
                  </h3>
                  <ul className="space-y-2 text-lg">
                    {results.personalizedInsights.recommendedMinistries.map((ministry, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500/80">•</span>
                        <span className="text-muted-foreground">{ministry}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-secondary/20 p-6 rounded-lg backdrop-blur-sm space-y-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    Growth Areas
                  </h3>
                  <ul className="space-y-2 text-lg">
                    {results.personalizedInsights.growthAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-cyan-500/80">•</span>
                        <span className="text-muted-foreground">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 