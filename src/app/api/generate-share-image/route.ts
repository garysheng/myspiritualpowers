import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QuizResultBackend } from '@/types';
import * as htmlToImage from 'html-to-image';
import { JSDOM } from 'jsdom';

export async function POST(request: Request) {
  try {
    const { userId, dimension } = await request.json();

    // Fetch user's results
    const resultDoc = await getDoc(doc(db, 'quiz_results', userId));
    if (!resultDoc.exists()) {
      return NextResponse.json({ error: 'Results not found' }, { status: 404 });
    }

    const resultData = resultDoc.data() as QuizResultBackend;
    const { spiritualArchetype, spiritualGifts } = resultData;

    // Create HTML template
    const width = dimension === 'square' ? 1080 : 1080;
    const height = dimension === 'square' ? 1080 : 1920;

    const template = `
      <div style="
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(to bottom right, #1a1a1a, #2d2d2d);
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      ">
        <div style="
          font-size: 24px;
          color: #a78bfa;
          margin-bottom: 20px;
        ">
          My Spiritual Power Archetype
        </div>
        
        <div style="
          font-size: 48px;
          font-weight: bold;
          background: linear-gradient(to right, #8b5cf6, #6366f1);
          -webkit-background-clip: text;
          color: transparent;
          margin-bottom: 40px;
        ">
          ${spiritualArchetype.name}
        </div>

        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
          margin-bottom: 40px;
        ">
          ${spiritualGifts.slice(0, 4).map((gift, index) => `
            <div style="
              background: rgba(255, 255, 255, 0.1);
              padding: 20px;
              border-radius: 12px;
              text-align: left;
            ">
              <div style="
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #a78bfa;
              ">
                ${gift.name}
              </div>
              <div style="
                font-size: 20px;
                color: #e5e7eb;
              ">
                ${gift.strength}% Strength
              </div>
            </div>
          `).join('')}
        </div>

        <div style="
          font-size: 20px;
          color: #9ca3af;
          margin-top: auto;
        ">
          Discover your spiritual gifts at
          <div style="
            color: #8b5cf6;
            font-weight: bold;
          ">
            myspiritualpowers.com
          </div>
        </div>
      </div>
    `;

    // Convert HTML to image
    const dom = new JSDOM();
    const document = dom.window.document;
    const container = document.createElement('div');
    container.innerHTML = template;

    const dataUrl = await htmlToImage.toPng(container, {
      width,
      height,
      quality: 1,
    });

    // Convert data URL to buffer
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="spiritual-powers-${dimension}.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
} 