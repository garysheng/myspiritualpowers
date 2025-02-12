import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizResponse, SpiritualGift } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);

interface LLMAnalysisResult {
  archetype: {
    name: string;
    description: string;
    biblicalExample: string;
    modernApplication: string;
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
  topGifts: SpiritualGift[]
): Promise<LLMAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `As a spiritual gifts analyst, analyze these quiz responses and the identified spiritual gifts to create a personalized spiritual profile. Format the response as a JSON object with the following structure:
  {
    "archetype": {
      "name": "A creative name for their spiritual power archetype based on their gift combination",
      "description": "A paragraph describing this archetype and how their gifts work together",
      "biblicalExample": "A biblical figure who demonstrated a similar combination of gifts",
      "modernApplication": "How this archetype can be effectively used in today's world"
    },
    "insights": {
      "summary": "A personalized paragraph analyzing their unique combination of gifts",
      "strengthsAndWeaknesses": "Analysis of how their gifts complement each other and potential blind spots",
      "recommendedMinistries": ["List of 3-5 specific ministry areas where they could thrive"],
      "growthAreas": ["List of 3-4 specific areas for development"]
    }
  }

  Quiz responses: ${JSON.stringify(responses, null, 2)}
  Top Spiritual Gifts: ${JSON.stringify(topGifts, null, 2)}

  Make the analysis personal, practical, and encouraging. Focus on how their unique combination of gifts can be used effectively in both church and daily life.`;

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