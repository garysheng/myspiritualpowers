import { NextResponse } from 'next/server';
import { ResultsEmail } from '@/components/email/results-email';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QuizResultBackend } from '@/types';
import { renderAsync } from '@react-email/render';

// Sample test data
const testData = {
  spiritualGifts: [
    {
      name: "Teaching",
      description: "The special ability to communicate biblical truth in a clear and compelling way that leads to understanding and growth.",
      strength: 85,
      biblicalReferences: ["Ephesians 4:11-13", "Romans 12:7", "1 Corinthians 12:28"],
      practicalApplications: ["Leading Bible studies", "Mentoring new believers", "Creating educational content"]
    },
    {
      name: "Leadership",
      description: "The divine enablement to cast vision, motivate, and direct people to harmoniously accomplish the purposes of God.",
      strength: 78,
      biblicalReferences: ["Romans 12:8", "1 Timothy 5:17", "Hebrews 13:17"],
      practicalApplications: ["Ministry coordination", "Project management", "Team building"]
    },
    {
      name: "Wisdom",
      description: "The ability to apply spiritual truth effectively to meet needs in specific situations.",
      strength: 72,
      biblicalReferences: ["1 Corinthians 2:6-13", "James 3:13-18", "Colossians 1:28"],
      practicalApplications: ["Counseling", "Problem-solving", "Decision-making"]
    }
  ],
  spiritualArchetype: {
    name: "Enlightened Guide",
    description: "You have a unique combination of gifts that positions you as a wise and effective teacher and leader. Your ability to understand and communicate truth, combined with your leadership capabilities, makes you particularly effective in guiding others toward spiritual growth and understanding.",
    biblicalExample: "The Apostle Paul exemplified this archetype through his extensive teaching ministry and leadership of early churches, combining deep spiritual wisdom with practical leadership abilities.",
    modernApplication: "In today's context, you would excel in roles that combine teaching and leadership, such as leading small groups, developing training programs, or mentoring future leaders. Your wisdom gift adds depth to both your teaching and leadership."
  },
  personalizedInsights: {
    summary: "Your gift combination reveals a strong orientation toward equipping and developing others. The synergy between your teaching, leadership, and wisdom gifts creates a powerful platform for both individual and group development.",
    strengthsAndWeaknesses: "Your teaching gift is enhanced by your wisdom, allowing you to not just convey information but apply it practically. Your leadership gift helps you organize and direct these efforts effectively. However, be mindful of balancing your strong teaching orientation with patience for those who learn differently.",
    recommendedMinistries: [
      "Small group leadership",
      "Discipleship program development",
      "Leadership training",
      "Educational ministry coordination",
      "Mentoring program organization"
    ],
    growthAreas: [
      "Developing more interactive teaching methods",
      "Balancing task focus with relationship building",
      "Incorporating more collaborative decision-making",
      "Practicing active listening skills"
    ]
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  let emailData;
  
  if (userId) {
    try {
      // Fetch real user data from Firestore
      const resultDoc = await getDoc(doc(db, 'quiz_results', userId));
      
      if (!resultDoc.exists()) {
        return NextResponse.json({ error: 'User results not found' }, { status: 404 });
      }
      
      const userData = resultDoc.data() as QuizResultBackend;
      emailData = {
        spiritualGifts: userData.spiritualGifts,
        spiritualArchetype: userData.spiritualArchetype,
        personalizedInsights: userData.personalizedInsights,
        resultsUrl: `https://myspiritualpowers.com/results/${userId}`,
        displayName: userData.displayName || 'there' // Use Firebase Auth display name with fallback
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
  } else {
    // Use test data
    emailData = {
      ...testData,
      resultsUrl: 'https://myspiritualpowers.com/results/test-user',
      displayName: 'there' // Default for test data
    };
  }

  // Generate email HTML using react-email's renderAsync function
  const emailHtml = await renderAsync(ResultsEmail(emailData));
  
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Email Preview</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 20px; background: #f6f9fc; }
          .preview-container { max-width: 800px; margin: 0 auto; }
          .preview-header { 
            background: #1a1a1a; 
            color: white; 
            padding: 15px; 
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .preview-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }
          .preview-controls button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            background: #4f46e5;
            color: white;
            cursor: pointer;
          }
          .preview-controls button:hover {
            background: #4338ca;
          }
          .preview-frame {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-header">
            <h1>Email Preview</h1>
            <div class="preview-controls">
              <button onclick="window.location.href='/dev/emails'">View Test Data</button>
              <button onclick="window.location.href='/dev/emails?userId=YOUR_USER_ID'">View User Data</button>
            </div>
            ${userId ? `<p>Viewing email for user: ${userId}</p>` : '<p>Viewing test data</p>'}
          </div>
          <div class="preview-frame">
            ${emailHtml}
          </div>
        </div>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
} 