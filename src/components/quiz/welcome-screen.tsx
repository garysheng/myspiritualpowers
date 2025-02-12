'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { Sparkles, Clock, Gift, BookOpen, Brain, ArrowRight, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const hasSavedProgress = typeof window !== 'undefined' && localStorage.getItem('quiz_progress') !== null;

  const handleStart = () => {
    trackEvent(AnalyticsEvents.QUIZ_START);
    onStart();
  };

  const handleNext = () => {
    trackEvent(AnalyticsEvents.WELCOME_NEXT);
    setStep(2);
  };

  const handleBack = () => {
    trackEvent(AnalyticsEvents.WELCOME_BACK);
    setStep(1);
  };

  return (
    <Card className="w-full max-w-3xl relative overflow-hidden bg-black/90 max-h-[90vh] flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-primary/3 to-indigo-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)]" />

      <div className="overflow-y-auto flex-1">
        {step === 1 ? (
          <>
            <CardHeader className="relative space-y-2 p-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-4xl text-center font-bold bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
                Discover Your Spiritual Gifts
              </CardTitle>
              <CardDescription className="text-base md:text-lg text-center text-muted-foreground">
                Uncover the unique ways God has equipped you to serve
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-4 p-4">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <Gift className="w-5 h-5" />
                  What to Expect
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-black/60 p-3 rounded-lg backdrop-blur-sm space-y-1 group hover:bg-black/80 transition-colors">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Quick & Thorough</span>
                    </div>
                    <ul className="space-y-0.5 text-xs sm:text-sm text-muted-foreground">
                      <li>• 135 thoughtful questions</li>
                      <li>• 20-25 minutes to complete</li>
                    </ul>
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg backdrop-blur-sm space-y-1 group hover:bg-black/80 transition-colors">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Biblical Insights</span>
                    </div>
                    <ul className="space-y-0.5 text-xs sm:text-sm text-muted-foreground">
                      <li>• Biblical references included</li>
                      <li>• Practical applications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="relative space-y-2 p-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-center font-bold">
                How to Answer
              </CardTitle>
              <CardDescription className="text-base md:text-lg text-center text-muted-foreground">
                Choose the option that best describes your experience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-4">
              <div className="bg-black/60 p-3 sm:p-4 rounded-lg backdrop-blur-sm">
                <p className="mb-4 text-center text-sm sm:text-base">This statement resonates with me...</p>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-black/80 transition-colors">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary/40 mt-2" />
                    <div>
                      <span className="font-medium text-sm sm:text-base">Not Really</span>
                      <p className="text-xs sm:text-sm text-muted-foreground">I don&apos;t identify with this statement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-black/80 transition-colors">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary/60 mt-2" />
                    <div>
                      <span className="font-medium text-sm sm:text-base">Somewhat</span>
                      <p className="text-xs sm:text-sm text-muted-foreground">I partially identify with this statement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-black/80 transition-colors">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary/80 mt-2" />
                    <div>
                      <span className="font-medium text-sm sm:text-base">Strongly</span>
                      <p className="text-xs sm:text-sm text-muted-foreground">I strongly identify with this statement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-black/80 transition-colors">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary mt-2" />
                    <div>
                      <span className="font-medium text-sm sm:text-base">Very Strongly</span>
                      <p className="text-xs sm:text-sm text-muted-foreground">This statement describes me perfectly</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </div>

      {/* Footer always stays at bottom */}
      <div className="relative">
        {step === 1 ? (
          <CardFooter className="p-4">
            <Button 
              size="lg" 
              className="w-full relative group"
              onClick={handleNext}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
              <span className="relative text-base flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="flex gap-2 p-4">
            <Button 
              variant="outline"
              size="lg" 
              className="flex-1"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="lg" 
              className="flex-1 relative group"
              onClick={handleStart}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
              <span className="relative text-base">
                {hasSavedProgress ? 'Continue Assessment' : 'Begin Assessment'}
              </span>
            </Button>
          </CardFooter>
        )}
      </div>
    </Card>
  );
} 