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
  responses: QuizResponse[];
  spiritualGifts: SpiritualGift[];
  spiritualArchetype: {
    name: string;
    description: string;
    biblicalExample: {
      concise: string;
      detailed: string;
    };
    modernApplication: {
      concise: string;
      detailed: string;
    };
  };
  personalizedInsights: {
    summary: string;
    strengthsAndWeaknesses: string;
    recommendedMinistries: string[];
    growthAreas: string[];
  };
  rating?: number;
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // Firestore Timestamp
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
  biblicalExample: {
    concise: string; // One sentence for PNG/sharing
    detailed: string; // Three sentences for detailed view
  };
  modernApplication: {
    concise: string; // One sentence for PNG/sharing
    detailed: string; // Three sentences for detailed view
  };
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

// Referral tracking
export interface UserProfile {
  userId: string;
  displayName?: string;
  photoURL?: string;
  referredBy?: string; // userId of the person who invited them
  referralCount: number; // number of people they've invited who completed the quiz
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 