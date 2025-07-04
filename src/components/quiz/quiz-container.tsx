'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LogIn, Sparkles, Star, Zap, Book, Mail } from 'lucide-react';
import { QUESTIONS, calculateGiftScores, GIFT_DESCRIPTIONS } from '@/data/spiritual-gifts-questions';
import { QuizProgress } from '@/types';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { WelcomeScreen } from './welcome-screen';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { analyzeSpiritualGifts } from '@/lib/analyze-spiritual-gifts';
import { LoaderOverlay } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'quiz_progress';

// Level configuration
const LEVELS = [
  { name: 'Level 1', questions: 25, description: 'Basic Assessment' },
  { name: 'Level 2', questions: 50, description: 'Deeper Insights' },
  { name: 'Level 3', questions: 60, description: 'Advanced Analysis' },
];

// Helper function to get current level info
const getCurrentLevelInfo = (questionIndex: number) => {
  let questionsSoFar = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    questionsSoFar += LEVELS[i].questions;
    if (questionIndex < questionsSoFar) {
      const questionsInCurrentLevel = LEVELS[i].questions;
      const questionIndexInLevel = questionIndex - (questionsSoFar - questionsInCurrentLevel);
      const progressInLevel = (questionIndexInLevel / questionsInCurrentLevel) * 100;
      return {
        level: i + 1,
        progressInLevel,
        levelName: LEVELS[i].name,
        levelDescription: LEVELS[i].description,
        questionsInLevel: questionsInCurrentLevel,
        questionIndexInLevel,
      };
    }
  }
  return null;
};

export function QuizContainer() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [progress, setProgress] = useState<QuizProgress>(() => {
    // Try to load saved progress from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startTime: new Date(parsed.startTime),
          lastUpdateTime: new Date(parsed.lastUpdateTime),
        };
      }
    }
    return {
      currentQuestionIndex: 0,
      responses: {},
      isComplete: false,
      startTime: new Date(),
      lastUpdateTime: new Date(),
    };
  });

  const currentQuestion = QUESTIONS[progress.currentQuestionIndex];
  const hasAnswer = progress.responses[currentQuestion.id] !== undefined;
  const isFirstQuestion = progress.currentQuestionIndex === 0;
  const isLastQuestion = progress.currentQuestionIndex === QUESTIONS.length - 1;

  // Get current level information
  const levelInfo = getCurrentLevelInfo(progress.currentQuestionIndex);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        lastUpdateTime: new Date(),
      }));
    }
  }, [isLastQuestion]);

  const handlePrevious = useCallback(() => {
    if (!isFirstQuestion) {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        lastUpdateTime: new Date(),
      }));
    }
  }, [isFirstQuestion]);

  const handleAnswer = useCallback(async (value: number, optionId: string) => {
    if (isAnimating) return;

    setSelectedOptionId(optionId);
    setIsAnimating(true);

    trackEvent(AnalyticsEvents.QUESTION_ANSWERED, {
      questionId: currentQuestion.id,
      answer: value,
      category: currentQuestion.category,
    });

    const newResponses = {
      ...progress.responses,
      [currentQuestion.id]: value,
    };

    setProgress(prev => ({
      ...prev,
      responses: newResponses,
      lastUpdateTime: new Date(),
    }));

    await new Promise(resolve => setTimeout(resolve, 300));
    setIsAnimating(false);
    setSelectedOptionId(null);

    if (isLastQuestion) {
      setShowSignup(true);
    } else {
      handleNext();
    }
  }, [isAnimating, currentQuestion, isLastQuestion, progress.responses, handleNext]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!hasStarted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        const option = [...currentQuestion.options].reverse()[optionIndex];
        if (option) {
          handleAnswer(option.value, option.id);
        }
      }
      else if (e.key === 'ArrowLeft' && !isFirstQuestion) {
        handlePrevious();
      }
      else if (e.key === 'ArrowRight' && !isLastQuestion && hasAnswer) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasStarted, currentQuestion, isFirstQuestion, isLastQuestion, hasAnswer, handleAnswer, handleNext, handlePrevious]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const handleStart = () => {
    setHasStarted(true);
    setProgress(prev => ({
      ...prev,
      startTime: new Date(),
      lastUpdateTime: new Date(),
    }));
  };

  const handleComplete = async () => {
    try {
      setIsAnalyzing(true);

      // Sign in with Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Convert responses to array format
      const responsesArray = Object.entries(progress.responses).map(([questionId, value]) => ({
        questionId,
        selectedOptionId: value.toString(),
        timestamp: new Date()
      }));

      // Calculate gift scores
      const scores = calculateGiftScores(progress.responses);
      const sortedGifts = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([gift, score]) => ({
          ...GIFT_DESCRIPTIONS[gift.toLowerCase()],
          strength: Math.round((score / 15) * 100),
        }));

      // Get AI analysis of spiritual gifts
      const llmAnalysis = await analyzeSpiritualGifts(responsesArray, sortedGifts, user.displayName || 'Seeker');

      // Check for referral from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const referrerId = urlParams.get('ref');

      // Create or update user profile
      const userProfileRef = doc(db, 'user_profiles', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);
      
      if (!userProfileDoc.exists()) {
        await setDoc(userProfileRef, {
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          referredBy: referrerId,
          referralCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // If there's a referrer, increment their referral count
        if (referrerId) {
          const referrerProfileRef = doc(db, 'user_profiles', referrerId);
          await updateDoc(referrerProfileRef, {
            referralCount: increment(1),
            updatedAt: new Date(),
          });
        }
      }

      // Save quiz results to Firestore
      const quizResult = {
        userId: user.uid,
        responses: responsesArray,
        timestamp: new Date(),
        email: user.email,
        spiritualGifts: sortedGifts,
        llmProvider: 'gemini',
        rawLlmResponse: llmAnalysis.rawResponse,
        spiritualArchetype: llmAnalysis.archetype,
        personalizedInsights: llmAnalysis.insights,
        referredBy: referrerId,
        // Only store display name and photo URL if they differ from Firebase Auth
        ...(user.displayName !== null && { displayName: user.displayName }),
        ...(user.photoURL !== null && { photoURL: user.photoURL }),
      };

      await setDoc(doc(db, 'quiz_results', user.uid), quizResult);

      // Send results email
      try {
        await fetch('/api/send-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userId: user.uid,
            spiritualGifts: sortedGifts,
            spiritualArchetype: llmAnalysis.archetype,
            personalizedInsights: llmAnalysis.insights,
          }),
        });
      } catch (emailError) {
        console.error('Error sending results email:', emailError);
        // Continue with redirect even if email fails
      }

      // Redirect to results page
      router.push(`/results/${user.uid}`);
    } catch (error) {
      console.error('Error completing quiz:', error);
      alert('There was an error saving your results. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user has already taken the quiz
      const resultDoc = await getDoc(doc(db, 'quiz_results', result.user.uid));
      if (resultDoc.exists()) {
        // If they have results, redirect to their results page
        router.push(`/results/${result.user.uid}`);
      } else {
        // If they haven't taken the quiz yet, start the quiz
        setHasStarted(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // New signup screen component
  const SignupScreen = () => (
    <Card className="w-full max-w-2xl p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
      <div className="relative space-y-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Your Results Are Almost Ready!</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;re almost there! Sign in to save your results and get personalized insights.
          </p>
        </div>

        <div className="bg-black/60 p-4 rounded-lg backdrop-blur-sm space-y-3">
          <p className="font-medium">You&apos;ll receive:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span>Your Spiritual Power Archetype</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Top 5 Spiritual Gifts Analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <Book className="w-4 h-4 text-primary" />
              <span>Biblical References & Applications</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>Detailed Results Email</span>
            </li>
          </ul>
        </div>

        <Button
          size="lg"
          onClick={handleComplete}
          className="w-full relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
          <span className="relative flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign in with Google to Get Results
          </span>
        </Button>
      </div>
    </Card>
  );

  if (!hasStarted) {
    return (
      <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center relative">
        <WelcomeScreen onStart={handleStart} />
        
        {/* Login Button - hidden on mobile */}
        <div className="hidden sm:block fixed bottom-4 w-full max-w-3xl mx-auto px-4">
          <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-primary text-sm"
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Already took the quiz? Log in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSignup) {
    return (
      <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center p-4">
        {isAnalyzing && (
          <LoaderOverlay message="Analyzing your spiritual gifts... This may take a moment." />
        )}
        <SignupScreen />
      </div>
    );
  }

  return (
    <>
      {isAnalyzing && (
        <LoaderOverlay message="Analyzing your spiritual gifts... This may take a moment." />
      )}

      <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 sm:space-y-8">
        <Card className="w-full max-w-2xl p-2 pb-0 sm:p-6 space-y-2 sm:space-y-6 relative overflow-hidden max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col">
          {/* Add semi-transparent dark backdrop */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          
          {/* Make content relative to appear above the backdrop */}
          <div className="relative space-y-2 sm:space-y-6 overflow-y-auto flex-1">
            {/* Progress indicator */}
            <div className="space-y-1 sm:space-y-2">
              {/* Question counter */}
              <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                <span>
                  Question {(levelInfo?.questionIndexInLevel ?? 0) + 1} of {levelInfo?.questionsInLevel ?? 0} in {levelInfo?.levelName ?? ''}
                </span>
              </div>

              {/* Overall progress bars */}
              <div className="flex gap-0.5 sm:gap-1 h-1">
                {LEVELS.map((level, index) => {
                  const levelStart = LEVELS.slice(0, index).reduce((sum, l) => sum + l.questions, 0);
                  const levelEnd = levelStart + level.questions;
                  const isCurrentLevel = progress.currentQuestionIndex >= levelStart && progress.currentQuestionIndex < levelEnd;
                  const isCompletedLevel = progress.currentQuestionIndex >= levelEnd;
                  const progressInThisLevel = isCompletedLevel ? 100 :
                    isCurrentLevel ? ((progress.currentQuestionIndex - levelStart) / level.questions) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 bg-secondary rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all duration-300 ${isCompletedLevel ? 'bg-primary/40' :
                            isCurrentLevel ? 'bg-primary' : 'bg-secondary'
                          }`}
                        style={{ width: `${progressInThisLevel}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question content */}
            <div className="space-y-3 sm:space-y-6">
              <h2 className="text-lg sm:text-2xl font-semibold min-h-[4rem] sm:min-h-[8rem] flex items-center">
                {currentQuestion.text}
              </h2>

              {/* Caption for answer options */}
              <p className="text-xs sm:text-sm text-muted-foreground italic">
                This statement resonates with me...
              </p>

              {/* Answer options */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-3">
                {[...currentQuestion.options].reverse().map((option, index) => {
                  const keyNumber = index + 1;
                  const optionLabels = [
                    'Not Really',    // value 0
                    'Somewhat',      // value 1
                    'Strongly',      // value 2
                    'Very Strongly', // value 3
                  ];
                  const fontWeights = [
                    'font-normal',     // Not Really
                    'font-medium',     // Somewhat
                    'font-semibold',   // Strongly
                    'font-bold',       // Very Strongly
                  ][index];
                  const intensityClasses = [
                    'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700', // Not Really
                    'hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800', // Somewhat
                    'hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700', // Strongly
                    'hover:bg-violet-100 dark:hover:bg-violet-900/50 border-violet-400 dark:border-violet-600', // Very Strongly
                  ][index];
                  const selectedClasses = [
                    'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500', // Not Really
                    'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600', // Somewhat
                    'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-500', // Strongly
                    'bg-violet-100 dark:bg-violet-900/50 border-violet-600 dark:border-violet-400', // Very Strongly
                  ][index];

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.value, option.id)}
                      disabled={isAnimating}
                      className={`group relative p-2 sm:p-4 text-center rounded-lg border-2 transition-all duration-200 ${selectedOptionId === option.id
                          ? 'scale-95 transform'
                          : progress.responses[currentQuestion.id] === option.value
                            ? selectedClasses
                            : `${intensityClasses} hover:scale-105`
                        } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                      <span className="flex items-center justify-center h-full min-h-[2rem] sm:min-h-[2.5rem]">
                        <span className={`${fontWeights} group-hover:sm:opacity-0 transition-opacity absolute ${selectedOptionId === option.id ? 'opacity-0' : ''
                          }`}>
                          {optionLabels[index]}
                        </span>
                        <span className={`text-sm text-muted-foreground transition-opacity absolute hidden sm:block ${selectedOptionId === option.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                          Press {keyNumber}
                        </span>
                        {selectedOptionId === option.id && (
                          <span className="animate-pulse">✓</span>
                        )}
                      </span>
                      {/* Selected checkmark */}
                      {progress.responses[currentQuestion.id] === option.value && (
                        <span className="absolute bottom-2 right-2 text-white/30 text-sm">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex justify-between items-center py-1.5 sm:py-4 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t sm:border-t-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className="h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleComplete}
                  disabled={!hasAnswer}
                  className="h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  Complete & Get Results
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  className="h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Keyboard shortcuts help */}
        <div className="hidden sm:block text-sm text-muted-foreground text-center space-y-2 mb-0 sm:mb-8">
          <div>
            <p>Use number keys (1-4) to select answers</p>
            <p>Use arrow keys (←/→) to navigate between questions</p>
          </div>
          <p className="text-xs italic">
            Your answers are saved automatically in your browser - you can leave and return anytime to continue where you left off.
          </p>
        </div>
      </div>
    </>
  );
} 