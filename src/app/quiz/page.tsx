import { QuizContainer } from '@/components/quiz/quiz-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spiritual Gifts Quiz - My Spiritual Powers',
  description: 'Discover your unique spiritual gifts through our interactive assessment. Answer questions to reveal your God-given abilities and learn how to use them effectively.',
};

export default function QuizPage() {
  return (
    <main>
      <QuizContainer />
    </main>
  );
} 