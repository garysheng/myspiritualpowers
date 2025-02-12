# AI Prompt Engineering Strategy

## Overview

Our spiritual gifts analysis uses two LLM models:
1. **Gemini Pro**: Primary analysis model
2. **DeepSeek**: Secondary validation model (future implementation)

## Prompt Structure

### Base Template
```typescript
const basePrompt = `As a spiritual gifts analyst with deep biblical knowledge, analyze these quiz responses to identify the person's spiritual gifts. Consider:

1. Response patterns and consistency
2. Biblical alignment and references
3. Practical applications and ministry opportunities
4. Personal growth and development areas

Quiz responses: {{RESPONSES}}

Provide a structured analysis in the following JSON format:
{
  "spiritualGifts": [
    {
      "name": string,
      "description": string,
      "strength": number (0-100),
      "biblicalReferences": string[],
      "practicalApplications": string[]
    }
  ],
  "analysis": {
    "overview": string,
    "keyPatterns": string[],
    "developmentAreas": string[],
    "ministryOpportunities": string[]
  }
}`;
```

### Response Processing
```typescript
interface ProcessedResponse {
  questionCategory: string;
  question: string;
  answer: string;
  strength: number;
  timestamp: string;
}

const formatResponses = (responses: QuizResponse[]): string => {
  const processed: ProcessedResponse[] = responses.map(/* processing logic */);
  return JSON.stringify(processed, null, 2);
};
```

## Prompt Engineering Guidelines

### 1. Context Setting
- Establish the role as a spiritual gifts analyst
- Reference biblical understanding
- Focus on practical application

### 2. Input Formatting
- Structure quiz responses clearly
- Include relevant metadata
- Maintain consistent JSON format

### 3. Output Requirements
- Specify exact JSON structure
- Define value ranges and types
- Include example formats

### 4. Analysis Depth
- Request multiple perspectives
- Balance spiritual and practical
- Consider growth opportunities

## Model-Specific Considerations

### Gemini Pro
```typescript
const geminiPrompt = `${basePrompt}

Additional considerations for Gemini analysis:
1. Focus on practical, real-world applications
2. Provide specific, actionable insights
3. Balance traditional and contemporary perspectives
4. Consider cultural context and relevance

Ensure all responses are:
- Biblically grounded
- Practically applicable
- Culturally sensitive
- Growth-oriented`;
```

### DeepSeek (Future)
```typescript
const deepseekPrompt = `${basePrompt}

Additional considerations for DeepSeek analysis:
1. Cross-reference with historical church perspectives
2. Analyze pattern consistency
3. Identify potential blind spots
4. Consider complementary gifts

Compare results with:
- Traditional gift assessments
- Biblical archetypes
- Ministry effectiveness patterns
- Contemporary applications`;
```

## Result Merging Strategy

### Comparison Approach
```typescript
interface GiftAnalysis {
  model: 'gemini' | 'deepseek';
  confidence: number;
  gifts: SpiritualGift[];
  analysis: AnalysisDetails;
}

const mergeAnalyses = (
  geminiAnalysis: GiftAnalysis,
  deepseekAnalysis: GiftAnalysis
): MergedAnalysis => {
  // Merging logic here
};
```

### Confidence Weighting
- Primary model (Gemini): 60% weight
- Secondary model (DeepSeek): 40% weight
- Adjust based on confidence scores
- Consider agreement levels

## Error Handling

### Response Validation
```typescript
const validateResponse = (response: any): boolean => {
  // Validation logic
  return true;
};
```

### Fallback Strategies
1. Retry with simplified prompt
2. Use cached analysis patterns
3. Fall back to primary model only
4. Provide generalized insights

## Continuous Improvement

### Feedback Loop
1. Track successful analyses
2. Monitor edge cases
3. Collect user feedback
4. Refine prompts based on results

### Version Control
- Document prompt versions
- Track performance metrics
- Note significant changes
- Maintain backwards compatibility

## Implementation Notes

1. **Environment Variables**
   ```typescript
   const config = {
     GEMINI_TEMPERATURE: 0.7,
     DEEPSEEK_TEMPERATURE: 0.5,
     MAX_TOKENS: 1000,
     RETRY_ATTEMPTS: 3
   };
   ```

2. **Rate Limiting**
   - Implement exponential backoff
   - Cache frequent patterns
   - Batch similar requests

3. **Monitoring**
   - Log prompt performance
   - Track response times
   - Monitor error rates
   - Analyze user satisfaction 