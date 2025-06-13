import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizResponse, SpiritualGift } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);

interface LLMAnalysisResult {
  archetype: {
    name: string;
    description: string;
    biblicalExample: {
      concise: string;
      detailed: string;
    };
    modernApplication: {
      concise: string;
      detailed: string;
    };
  };
  insights: {
    summary: string;
    strengthsAndWeaknesses: string;
    recommendedMinistries: string[];
    growthAreas: string[];
  };
  rawResponse: string;
}

export async function analyzeSpiritualGifts(
  responses: QuizResponse[],
  topGifts: SpiritualGift[],
  displayName: string
): Promise<LLMAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const prompt = `As a spiritual gifts analyst, analyze these quiz responses and the identified spiritual gifts to create a personalized spiritual profile for ${displayName}. Format the response as a JSON object with the following structure:
  {
    "archetype": {
      "name": "A creative name for their spiritual power archetype based on their gift combination",
      "description": "A paragraph describing this archetype and how their gifts work together",
      "biblicalExample": {
        "concise": "One powerful sentence summarizing the biblical figure and their key relevant story. Example: 'Like Samuel who heard God's voice and guided Israel with prophetic wisdom (1 Samuel 3:1-18).' or 'Like Barnabas who used discernment to advocate for Paul when others were skeptical (Acts 9:26-27).'",
        "detailed": "Write exactly three sentences: First sentence simply states the biblical figure's name. Second sentence describes a specific story showing these gifts in action with scripture reference. Third sentence explains how this connects to the person's gift combination. Example: 'Samuel. As a young boy, Samuel heard God's voice and delivered difficult messages to Eli, demonstrating both his prophetic and pastoral gifts (1 Samuel 3:1-18). Like Samuel, your combination of prophecy and pastoral care enables you to deliver truth with wisdom and compassion.'"
      },
      "modernApplication": {
        "concise": "One powerful sentence describing how this gift combination can be used today. Example: 'You can be a transformative leader who combines prophetic insight with pastoral care to guide others through times of change.' or 'Your unique ability to discern potential in others while offering encouragement makes you invaluable in mentoring and community building.'",
        "detailed": "Write exactly three sentences describing modern applications. First sentence should focus on primary impact area. Second sentence should give specific examples. Third sentence should inspire action. Example: 'Your gift combination is perfectly suited for transformational leadership in today's complex world. You can guide faith communities through change by combining prophetic insight with pastoral sensitivity, whether in counseling sessions, group discussions, or strategic planning. Your ability to both see God's direction and shepherd people with compassion positions you to be a crucial bridge-builder in times of transition.'"
      }
    },
    "insights": {
      "summary": "A personalized paragraph analyzing their unique combination of gifts, addressing ${displayName} by name",
      "strengthsAndWeaknesses": "Analysis of how their gifts complement each other and potential blind spots",
      "recommendedMinistries": ["List of 3-5 specific ministry areas where they could thrive"],
      "growthAreas": ["List of 3-4 specific areas for development"]
    }
  }

  Quiz responses: ${JSON.stringify(responses, null, 2)}
  Top Spiritual Gifts: ${JSON.stringify(topGifts, null, 2)}

  Make the analysis personal, practical, and encouraging. Focus on how their unique combination of gifts can be used effectively in both faith community and daily life.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      rawResponse: text
    };
  } catch (error) {
    console.error('Error analyzing spiritual gifts:', error);
    throw new Error('Failed to analyze spiritual gifts');
  }
} 