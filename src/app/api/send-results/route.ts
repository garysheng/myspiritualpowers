import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { ResultsEmail } from '@/components/email/results-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, userId, spiritualGifts, spiritualArchetype, personalizedInsights, displayName } = await request.json();

    const data = await resend.emails.send({
      from: 'hello@myspiritualpowers.com',
      to: email,
      subject: 'Your Spiritual Powers Assessment Results',
      react: ResultsEmail({
        spiritualGifts,
        spiritualArchetype,
        personalizedInsights,
        resultsUrl: `https://myspiritualpowers.com/results/${userId}`,
        displayName: displayName || 'there'
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
} 