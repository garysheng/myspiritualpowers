'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailInviteDialog } from '@/components/share/email-invite-dialog';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'user_profiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100svh-4rem)] p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Profile picture'}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Community Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/30 p-6 rounded-lg space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {profile?.referralCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  People Discovered Their Gifts Through You
                </div>
              </div>
              {profile?.referredBy && (
                <div className="bg-secondary/30 p-6 rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground">
                    You were invited by someone who cares about your spiritual journey
                  </div>
                </div>
              )}
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={() => setEmailDialogOpen(true)}
            >
              <Mail className="w-4 h-4" />
              Invite More People
            </Button>
          </CardContent>
        </Card>
      </div>

      <EmailInviteDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
    </div>
  );
} 