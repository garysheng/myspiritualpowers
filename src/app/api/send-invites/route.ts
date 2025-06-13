import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { InviteEmail } from '@/components/email/invite-email';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Validate bearer token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 401 }
      );
    }

    // Verify the token using Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request data
    const { emails, customMessage } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0 || emails.length > 200) {
      return NextResponse.json(
        { error: 'Invalid email list. Must provide between 1 and 200 emails.' },
        { status: 400 }
      );
    }

    // Get user's quiz result for archetype info
    const userDoc = await getDoc(doc(db, 'quiz_results', decodedToken.uid));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User has not completed the quiz' },
        { status: 400 }
      );
    }

    const quizResult = userDoc.data();
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${decodedToken.uid}`;
    const inviterResultsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results/${decodedToken.uid}`;
    
    // Send emails in batches of 50 to avoid rate limits
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(async (email: string) => {
        try {
          const data = await resend.emails.send({
            from: 'My Spiritual Powers <invites@myspiritualpowers.com>',
            to: email,
            subject: `${decodedToken.name || 'Someone'} invited you to discover your spiritual gifts!`,
            react: InviteEmail({
              inviterName: decodedToken.name || 'Someone',
              inviterArchetype: quizResult.spiritualArchetype?.name || 'Spiritual Seeker',
              customMessage,
              inviteUrl,
              inviterResultsUrl,
            }),
          });
          return { email, status: 'success', data };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return { email, status: 'error', error };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      message: `Successfully sent ${successCount} invitations. Failed to send ${failureCount} invitations.`,
      results
    });

  } catch (error) {
    console.error('Error sending invites:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
} 