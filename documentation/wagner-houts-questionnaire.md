# Wagner-Modified Houts Questionnaire Analysis

## Overview
The Wagner-Modified Houts Questionnaire is a comprehensive spiritual gifts assessment tool that evaluates 27 distinct spiritual gifts through 135 questions.

## Scoring System
- More = 3 points
- Some = 2 points
- A Little = 1 point
- Not at all = 0 points

## Gift Categories

### Word Gifts
1. **Prophecy** (Questions: 1, 28, 55, 82, 109)
   - Biblical References: Luke 7:26, Acts 15:32, Acts 21:9-11, Romans 12:6, 1 Corinthians 12:10, 28, Ephesians 4:11-13

2. **Pastor** (Questions: 2, 29, 56, 83, 110)
   - Biblical References: John 10:1-18, Ephesians 4:11-13, 1 Timothy 3:1-7, 1 Peter 5:1-3

3. **Teaching** (Questions: 3, 30, 57, 84, 111)
   - Biblical References: Acts 18:24-28, Acts 20:20-21, Romans 12:7, 1 Corinthians 12:28, Ephesians 4:11-13

### Knowledge Gifts
4. **Wisdom** (Questions: 4, 31, 58, 85, 112)
   - Biblical References: Acts 6:3,10, 1 Corinthians 2:1-13, 12:8, James 1:5-6, 2 Peter 3:15-16

5. **Knowledge** (Questions: 5, 32, 59, 86, 113)
   - Biblical References: Acts 5:1-11, 1 Corinthians 2:14, 12:8, 2 Corinthians 11:6, Colossians 2:2-3

### Power Gifts
6. **Faith** (Questions: 41, 68, 95, 122)
   - Biblical References: Acts 11:22-24, 27:21-25, Romans 4:18-21, 1 Corinthians 12:9, Hebrews 11

7. **Healing** (Questions: 18, 45, 72, 99, 126)
   - Biblical References: Acts 3:1-10, 5:12-16, 9:32-35, 28:7-10, 1 Corinthians 12:9, 28

8. **Miracles** (Questions: 17, 44, 71, 98, 125)
   - Biblical References: Acts 9:36-42, 19:11-20, 20:7-12, Romans 15:18-19, 1 Corinthians 12:10, 28

### Service Gifts
9. **Helps** (Questions: 9, 36, 63, 90, 117)
   - Biblical References: Mark 15:40-41, Luke 8:2-3, Acts 9:36, Romans 16:1-2, 1 Corinthians 12:28

10. **Service** (Questions: 25, 52, 79, 106, 133)
    - Biblical References: Acts 6:1-7, Romans 12:7, Galatians 6:2,10, 2 Timothy 1:16-18, Titus 3:14

11. **Administration** (Questions: 16, 43, 70, 97, 124)
    - Biblical References: Luke 14:28-30, Acts 6:1-7, 27:11, 1 Corinthians 12:28, Titus 1:5

### People Gifts
12. **Encouragement** (Questions: 6, 33, 60, 87, 114)
    - Biblical References: Acts 14:22, Romans 12:8, 1 Timothy 4:13, Hebrews 10:25

13. **Giving** (Questions: 8, 35, 62, 89, 116)
    - Biblical References: Mark 12:41-44, Romans 12:8, 2 Corinthians 8:1-7, 9:2-8

14. **Leadership** (Questions: 14, 42, 69, 96, 123)
    - Biblical References: Luke 9:51, Acts 7:10, 15:7-11, Romans 12:8, 1 Timothy 5:17, Hebrews 13:17

## Scoring Sheet Template
```typescript
interface GiftScore {
  gift: string;
  questions: number[];
  score: number;
  biblical_references: string[];
}

interface QuestionnaireResult {
  dominant_gifts: GiftScore[];    // Top 3 highest scores
  subordinate_gifts: GiftScore[]; // Next 3 highest scores
  raw_scores: Record<string, number>;
  timestamp: Date;
}
```

## Implementation Notes

### Question Design Learnings
1. Questions are behavior-based rather than theoretical
2. Each gift is tested through multiple scenarios
3. Questions progress from past experience to future potential
4. Balance between spiritual and practical applications

### Scoring Algorithm
```typescript
function calculateGiftScore(responses: QuizResponse[], giftQuestions: number[]): number {
  return giftQuestions.reduce((score, questionId) => {
    const response = responses.find(r => r.questionId === questionId);
    return score + (response?.value || 0);
  }, 0);
}
```

### AI Integration Points
1. Use response patterns to validate gift identification
2. Cross-reference biblical examples with user responses
3. Generate personalized development recommendations
4. Provide contemporary applications of identified gifts

### Mobile Adaptations
1. Break 135 questions into manageable segments
2. Use swipe gestures for quick scoring
3. Show progress and estimated completion time
4. Provide intermittent encouragement

### Results Presentation
1. Show primary and secondary gift clusters
2. Include biblical references and examples
3. Suggest practical ministry applications
4. Provide growth and development paths 