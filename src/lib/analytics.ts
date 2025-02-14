import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

export const trackEvent = async (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
  try {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Predefined events for consistent tracking
export const AnalyticsEvents = {
  QUIZ_START: 'quiz_start',
  QUESTION_ANSWERED: 'question_answered',
  QUIZ_COMPLETED: 'quiz_completed',
  RESULTS_VIEWED: 'results_viewed',
  RESULTS_SHARED: 'results_shared',
  RESULTS_DOWNLOADED: 'results_downloaded',
  RESULTS_RATED: 'results_rated',
  BIBLE_REFERENCE_CLICKED: 'bible_reference_clicked',
  WELCOME_NEXT: 'welcome_next',
  WELCOME_BACK: 'welcome_back',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Example usage:
// trackEvent(AnalyticsEvents.QUIZ_START);
// trackEvent(AnalyticsEvents.QUESTION_ANSWERED, { questionId: '1', answer: 'yes' }); 