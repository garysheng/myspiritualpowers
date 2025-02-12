'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const isQuizPage = pathname === '/quiz';
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 h-12 sm:h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 bg-background rounded-lg ring-1 ring-gray-900/5">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
                MySpiritualPowers.com
              </span>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className={`relative ${
              pathname === '/' 
                ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' 
                : 'text-muted-foreground hover:text-foreground transition-colors'
            }`}
          >
            Home
          </Link>
          {!isQuizPage && (
            user ? (
              <Link href="/profile">
                {user.photoURL ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </Link>
            ) : (
              <Link href="/quiz">
                <Button 
                  className="relative group h-7 sm:h-9 px-2.5 sm:px-4 text-sm"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
                  <span className="relative">Take the Quiz</span>
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
} 