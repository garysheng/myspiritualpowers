import { analytics } from './firebase';
import { logEvent, Analytics } from 'firebase/analytics';

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics !== null) {
    logEvent(analytics, eventName, eventParams);
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
  COMMUNITY_CTA_CLICKED: 'community_cta_clicked',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Example usage:
// trackEvent(AnalyticsEvents.QUIZ_START);
// trackEvent(AnalyticsEvents.QUESTION_ANSWERED, { questionId: '1', answer: 'yes' }); 