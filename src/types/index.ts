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
  id: string;
  userId?: string;
  responses: QuizResponse[];
  timestamp: FirebaseTimestamp;
  spiritualGifts: SpiritualGift[];
  llmProvider: 'gemini' | 'deepseek';
  rawLlmResponse: string;
}

// Frontend Types
export interface QuizResult extends Omit<QuizResultBackend, 'timestamp'> {
  timestamp: Date;
}

export interface SpiritualGift {
  name: string;
  description: string;
  strength: number; // 0-100
  biblicalReferences: string[];
  practicalApplications: string[];
}

// Firebase types placeholder - will be properly imported from firebase
type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
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