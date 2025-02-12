'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const isQuizPage = pathname === '/quiz';

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          My Spiritual Powers
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className={pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}
          >
            Home
          </Link>
          {!isQuizPage && (
            <Link href="/quiz">
              <Button>Take the Quiz</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
} 