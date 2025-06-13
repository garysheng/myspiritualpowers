import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizResponse, SpiritualGift } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function analyzeSpiritualGifts(responses: QuizResponse[]): Promise<{
  spiritualGifts: SpiritualGift[];
  rawResponse: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const prompt = `As a spiritual gifts analyst, analyze these quiz responses and identify the person's spiritual gifts. Format the response as a JSON object with the following structure:
  {
    "spiritualGifts": [
      {
        "name": "Gift name",
        "description": "Detailed description of the gift",
        "strength": number between 0-100,
        "biblicalReferences": ["verse1", "verse2"],
        "practicalApplications": ["application1", "application2"]
      }
    ]
  }

  Quiz responses: ${JSON.stringify(responses, null, 2)}

  Provide thoughtful, biblically-based analysis. Focus on practical applications and specific ways to use these gifts.`;

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
      spiritualGifts: parsed.spiritualGifts,
      rawResponse: text
    };
  } catch (error) {
    console.error('Error analyzing spiritual gifts:', error);
    throw new Error('Failed to analyze spiritual gifts');
  }
} 