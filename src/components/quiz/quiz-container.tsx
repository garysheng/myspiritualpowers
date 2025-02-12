'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QUESTIONS, calculateGiftScores, GIFT_DESCRIPTIONS } from '@/data/spiritual-gifts-questions';
import { QuizProgress } from '@/types';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { WelcomeScreen } from './welcome-screen';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { analyzeSpiritualGifts } from '@/lib/analyze-spiritual-gifts';
import { LoaderOverlay } from '@/components/ui/loader';

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
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const currentQuestion = QUESTIONS[progress.currentQuestionIndex];
  const hasAnswer = progress.responses[currentQuestion.id] !== undefined;
  const isFirstQuestion = progress.currentQuestionIndex === 0;
  const isLastQuestion = progress.currentQuestionIndex === QUESTIONS.length - 1;

  // Get current level information
  const levelInfo = getCurrentLevelInfo(progress.currentQuestionIndex);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!hasStarted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle number keys 1-4
      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1; // Map directly to index (1=first option)
        const option = [...currentQuestion.options].reverse()[optionIndex];
        if (option) {
          handleAnswer(option.value, option.id);
        }
      }
      // Handle left/right arrow keys for navigation
      else if (e.key === 'ArrowLeft' && !isFirstQuestion) {
        handlePrevious();
      }
      else if (e.key === 'ArrowRight' && !isLastQuestion && hasAnswer) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasStarted, currentQuestion, isFirstQuestion, isLastQuestion, hasAnswer]);

  const handleAnswer = async (value: number, optionId: string) => {
    if (isAnimating) return; // Prevent multiple selections during animation

    setSelectedOptionId(optionId);
    setIsAnimating(true);

    // Track the answer
    trackEvent(AnalyticsEvents.QUESTION_ANSWERED, {
      questionId: currentQuestion.id,
      answer: value,
      category: currentQuestion.category,
    });

    // Update responses immediately
    const newResponses = {
      ...progress.responses,
      [currentQuestion.id]: value,
    };

    setProgress(prev => ({
      ...prev,
      responses: newResponses,
      lastUpdateTime: new Date(),
    }));

    // Wait for animation before navigating
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsAnimating(false);
    setSelectedOptionId(null);

    // Only auto-advance if it's not the last question
    if (!isLastQuestion) {
      handleNext();
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        lastUpdateTime: new Date(),
      }));
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        lastUpdateTime: new Date(),
      }));
    }
  };

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

      // Get LLM analysis
      const llmAnalysis = await analyzeSpiritualGifts(responsesArray, sortedGifts);

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
      };

      await setDoc(doc(db, 'quiz_results', user.uid), quizResult);

      // Redirect to results page
      window.location.href = `/results/${user.uid}`;
    } catch (error) {
      console.error('Error completing quiz:', error);
      alert('There was an error saving your results. Please try again.');
      setIsAnalyzing(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center p-4">
        <WelcomeScreen onStart={handleStart} />
      </div>
    );
  }

  return (
    <>
      {isAnalyzing && (
        <LoaderOverlay message="Analyzing your spiritual gifts... This may take a moment." />
      )}
      
      <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center p-4 space-y-8">
        <Card className="w-full max-w-2xl p-6 space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            {/* Question counter */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Question {(levelInfo?.questionIndexInLevel ?? 0) + 1} of {levelInfo?.questionsInLevel ?? 0} in {levelInfo?.levelName ?? ''}
              </span>
            </div>
            
            {/* Overall progress bars */}
            <div className="flex gap-1 h-1">
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
                      className={`h-full transition-all duration-300 ${
                        isCompletedLevel ? 'bg-primary/40' :
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
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold min-h-[8rem] flex items-center">
              {currentQuestion.text}
            </h2>

            {/* Caption for answer options */}
            <p className="text-sm text-muted-foreground italic">
              This statement resonates with me...
            </p>

            {/* Answer options */}
            <div className="grid grid-cols-4 gap-3">
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
                    className={`group relative p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                      selectedOptionId === option.id
                        ? 'scale-95 transform'
                        : progress.responses[currentQuestion.id] === option.value
                        ? selectedClasses
                        : `${intensityClasses} hover:scale-105`
                    } ${
                      isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center justify-center h-full min-h-[2.5rem]">
                      <span className={`${fontWeights} group-hover:opacity-0 transition-opacity absolute ${
                        selectedOptionId === option.id ? 'opacity-0' : ''
                      }`}>
                        {optionLabels[index]}
                      </span>
                      <span className={`text-sm text-muted-foreground transition-opacity absolute ${
                        selectedOptionId === option.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        Press {keyNumber}
                      </span>
                      {selectedOptionId === option.id && (
                        <span className="animate-pulse">✓</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={!hasAnswer}
                className="flex items-center gap-2"
              >
                Complete & Get Results
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnswer}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Keyboard shortcuts help */}
        <div className="text-sm text-muted-foreground text-center space-y-2">
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