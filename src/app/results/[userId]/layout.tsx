import { Metadata } from 'next';
import { db } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase-admin';

interface Props {
  children: React.ReactNode;
  params: Promise<{
    userId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  try {
    // Get user's display name from Firebase Auth
    const userRecord = await auth.getUser(userId);
    const displayName = userRecord.displayName || 'Someone';

    // Fetch quiz results from Firestore
    const userDoc = await db.collection('quiz_results').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return {
        title: 'Results Not Found - My Spiritual Powers',
        description: 'The requested spiritual powers results could not be found.',
      };
    }

    const title = `${displayName}'s Spiritual Powers - ${userData.spiritualArchetype.name}`;
    const description = `Discover how ${displayName} embodies the ${userData.spiritualArchetype.name} archetype and their top spiritual gifts. Take the quiz to uncover your own spiritual powers!`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        images: [{
          url: '/og.png', // Use static image for now
          width: 1200,
          height: 630,
          alt: 'My Spiritual Powers Results',
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og.png'], // Use static image for now
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'My Spiritual Powers Results',
      description: 'Discover your unique spiritual gifts and divine purpose through our comprehensive assessment.',
    };
  }
}

export default function ResultsLayout({ children }: Props) {
  return children;
} 