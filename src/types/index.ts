import { Timestamp } from 'firebase/firestore';

export interface QuizQuestion {
  id: string;
  text: string;
  category: 'tendencies' | 'experiences' | 'desires' | 'skills';
  options: QuizOption[];
  weight: number;
}

export interface QuizOption {
  id: string;
  text: string;
  value: number;
}

export interface QuizResponse {
  questionId: string;
  selectedOptionId: string;
  timestamp: Date;
}

// Backend Types (Firestore)
export interface QuizResultBackend {
  userId: string;
  displayName: string;
  photoURL?: string;
  responses: Array<{
    questionId: string;
    selectedOptionId: string;
  }>;
  spiritualGifts: SpiritualGift[];
  spiritualArchetype: {
    name: string;
    description: string;
    biblicalExample: string;
    modernApplication: string;
  };
  personalizedInsights: {
    summary: string;
    strengthsAndWeaknesses: string;
    recommendedMinistries: string[];
    growthAreas: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Frontend Types
export interface QuizResult extends Omit<QuizResultBackend, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

export interface SpiritualGift {
  name: string;
  description: string;
  strength: number; // 0-100
  biblicalReferences: string[];
  practicalApplications: string[];
}

export interface SpiritualArchetype {
  name: string;
  description: string;
  biblicalExample: string;
  modernApplication: string;
}

export interface PersonalizedInsights {
  summary: string;
  strengthsAndWeaknesses: string;
  recommendedMinistries: string[];
  growthAreas: string[];
}

// Quiz Categories
export type QuizCategory = 'tendencies' | 'experiences' | 'desires' | 'skills';

// Quiz Progress
export interface QuizProgress {
  currentQuestionIndex: number;
  responses: Record<string, number>;
  isComplete: boolean;
  startTime: Date;
  lastUpdateTime: Date;
} 