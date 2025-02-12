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
    <Card className="w-full max-w-3xl relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />

      {step === 1 ? (
        <>
          <CardHeader className="relative space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl md:text-5xl text-center font-bold bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent pb-2">
              Discover Your Spiritual Gifts
            </CardTitle>
            <CardDescription className="text-xl text-center text-muted-foreground">
              Uncover the unique ways God has equipped you to serve and make a difference
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-primary">
                <Gift className="w-6 h-6" />
                What to Expect
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm space-y-2 group hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Quick & Thorough</span>
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 135 thoughtful questions</li>
                    <li>• 20-25 minutes to complete</li>
                  </ul>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm space-y-2 group hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>Biblical Insights</span>
                  </div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Biblical references included</li>
                    <li>• Practical applications</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative">
            <Button 
              size="lg" 
              className="w-full relative group"
              onClick={handleNext}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
              <span className="relative text-lg flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="relative space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                <Brain className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl text-center font-bold">
              How to Answer
            </CardTitle>
            <CardDescription className="text-xl text-center text-muted-foreground">
              Choose the option that best describes your experience
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="bg-secondary/30 p-6 rounded-lg backdrop-blur-sm">
              <p className="mb-6 text-center text-lg">This statement resonates with me...</p>
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-primary/40 mt-2" />
                  <div>
                    <span className="font-medium text-lg">Not Really</span>
                    <p className="text-muted-foreground">I don't identify with this statement</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-primary/60 mt-2" />
                  <div>
                    <span className="font-medium text-lg">Somewhat</span>
                    <p className="text-muted-foreground">I partially identify with this statement</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-primary/80 mt-2" />
                  <div>
                    <span className="font-medium text-lg">Strongly</span>
                    <p className="text-muted-foreground">I strongly identify with this statement</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                  <div>
                    <span className="font-medium text-lg">Very Strongly</span>
                    <p className="text-muted-foreground">This statement describes me perfectly</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative flex gap-3">
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
              <span className="relative text-lg">
                {hasSavedProgress ? 'Continue Assessment' : 'Begin Assessment'}
              </span>
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
} 