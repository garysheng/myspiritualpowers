# Question Design Strategy

## Core Principles

1. **Brevity**: Keep questions short and focused
2. **Clarity**: Use simple, unambiguous language
3. **Relevance**: Focus on real-world applications
4. **Engagement**: Make questions interesting and relatable
5. **Inclusivity**: Ensure questions are culturally sensitive
6. **Balance**: Cover both practical and spiritual aspects

## Question Categories

### 1. Natural Tendencies
- How you naturally respond to situations
- What energizes or drains you
- Your default approach to problems

### 2. Spiritual Experiences
- Past experiences in ministry/service
- Moments of spiritual significance
- Impact on others' spiritual lives

### 3. Heart's Desires
- What brings you joy in serving
- Areas you feel drawn to
- Passion points in ministry

### 4. Skill Assessment
- Natural and developed abilities
- Areas of effectiveness
- Feedback from others

## Question Format

### Structure
```typescript
interface QuizQuestion {
  id: string;
  text: string;
  category: 'tendencies' | 'experiences' | 'desires' | 'skills';
  options: {
    id: string;
    text: string;
    value: number;
    giftIndicators: string[]; // spiritual gifts this answer might indicate
  }[];
  weight: number; // importance in the overall assessment
}
```

### Response Scale
- 5-point scale for most questions
- Simple Yes/No for experience-based questions
- "Select all that apply" for specific scenarios

## Sample Questions

### Natural Tendencies
1. "When in a group, I tend to..."
   - Notice those who need help
   - Start organizing activities
   - Share insights and knowledge
   - Encourage others

### Spiritual Experiences
1. "In the past year, I have..."
   - Helped someone understand a Bible passage
   - Provided comfort to someone in crisis
   - Led a group or project
   - Felt God's guidance strongly

### Heart's Desires
1. "I feel most fulfilled when..."
   - Teaching others about faith
   - Helping those in need
   - Leading projects or teams
   - Praying for others

### Skill Assessment
1. "Others often come to me for..."
   - Advice and wisdom
   - Help and support
   - Leadership and direction
   - Prayer and encouragement

## AI Integration Strategy

### Input Processing
- Convert answers into structured data
- Weight responses based on question importance
- Consider patterns across categories

### Analysis Factors
1. **Response Patterns**
   - Consistent themes
   - Strong preferences
   - Notable aversions

2. **Cross-Category Correlation**
   - Alignment between desires and experiences
   - Natural tendencies supporting skills
   - Potential growth areas

3. **Biblical Alignment**
   - Match patterns to biblical gift descriptions
   - Consider scriptural examples
   - Align with biblical principles

### Output Format
```typescript
interface GiftAnalysis {
  primaryGifts: SpiritualGift[];
  supportingGifts: SpiritualGift[];
  potentialAreas: string[];
  biblicalReferences: string[];
  practicalApplications: string[];
  developmentSuggestions: string[];
}
```

## Implementation Notes

1. **Progressive Disclosure**
   - Start with broader questions
   - Drill down based on initial responses
   - Adapt question flow based on patterns

2. **Mobile Optimization**
   - One question per screen
   - Simple tap interactions
   - Clear progress indication

3. **Engagement Features**
   - Smooth transitions
   - Visual feedback
   - Encouraging messages

4. **Results Presentation**
   - Immediate initial insights
   - Detailed analysis after processing
   - Visual representation of gifts
   - Practical next steps 