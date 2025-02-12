'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const hasSavedProgress = typeof window !== 'undefined' && localStorage.getItem('quiz_progress') !== null;

  const handleStart = () => {
    trackEvent(AnalyticsEvents.QUIZ_START);
    onStart();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">Discover Your Spiritual Gifts</CardTitle>
        <CardDescription className="text-lg">
          Uncover the unique ways God has equipped you to serve and make a difference
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">What to Expect</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>135 thoughtful questions about your experiences and preferences</li>
            <li>Takes approximately 20-25 minutes to complete</li>
            <li>Identifies your top spiritual gifts with biblical references</li>
            <li>Provides practical ways to use your gifts</li>
            <li>You&apos;ll receive personalized insights</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">How to Answer</h3>
          <p>For each statement, choose how well it describes you:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>More - This is definitely true for me</li>
            <li>Some - This is sometimes true for me</li>
            <li>A Little - This is occasionally true for me</li>
            <li>Not at all - This doesn&apos;t describe me</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleStart}
        >
          {hasSavedProgress ? 'Continue Assessment' : 'Begin Assessment'}
        </Button>
      </CardFooter>
    </Card>
  );
} 