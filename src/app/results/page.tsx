'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoaderOverlay } from '@/components/ui/loader';

export default function ResultsRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is logged in, redirect to their results page
      router.replace(`/results/${user.uid}`);
    } else {
      // User is not logged in, redirect to homepage
      router.replace('/');
    }
  }, [user, loading, router]);

  return <LoaderOverlay message="Loading your results..." />;
} 