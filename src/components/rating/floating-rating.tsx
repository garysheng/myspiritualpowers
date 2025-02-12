'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface FloatingRatingProps {
  userId: string;
  onRated: () => void;
}

export function FloatingRating({ userId, onRated }: FloatingRatingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Only show after scrolling down a bit
      if (window.scrollY > 300) {
        setIsVisible(true);
        
        // Hide after no scrolling for 2 seconds
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleRate = async (selectedRating: number) => {
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'quiz_results', userId), {
        rating: selectedRating,
        ratedAt: new Date(),
      });

      trackEvent(AnalyticsEvents.RESULTS_RATED, { rating: selectedRating });
      setRating(selectedRating);
      onRated();
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible || rating > 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-6 shadow-lg pointer-events-auto transform transition-all duration-200 ease-out">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">How helpful was this assessment?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={isSubmitting}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`p-1 transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 