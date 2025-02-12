import { SpiritualGift, SpiritualArchetype, PersonalizedInsights } from '@/types';
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Button,
} from '@react-email/components';

interface ResultsEmailProps {
  spiritualGifts: SpiritualGift[];
  spiritualArchetype: SpiritualArchetype;
  personalizedInsights: PersonalizedInsights;
  resultsUrl: string;
  displayName: string;
}

export const ResultsEmail = ({
  spiritualGifts,
  spiritualArchetype,
  personalizedInsights,
  resultsUrl,
  displayName,
}: ResultsEmailProps) => {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Your Spiritual Powers Assessment Results</Text>
            
            {/* Introduction */}
            <Text style={paragraph}>
              Congratulations {displayName}! Your responses to the Spiritual Powers Assessment have revealed a unique combination of spiritual gifts that God has bestowed upon you. These gifts are not just abilities, but divine empowerments meant to build up the Body of Christ and make a meaningful impact in the world.
            </Text>
            
            <Text style={paragraph}>
              Below you&apos;ll find your personalized results, including your Spiritual Power Archetype and top spiritual gifts. We encourage you to prayerfully consider how you can develop and use these gifts in your daily life and ministry.
            </Text>
            
            <Hr style={divider} />
            
            {/* Spiritual Archetype */}
            <Text style={subheading}>Your Spiritual Power Archetype: {spiritualArchetype.name}</Text>
            <Text style={paragraph}>{spiritualArchetype.description}</Text>
            
            {/* Top Spiritual Gifts */}
            <Text style={subheading}>Your Top Spiritual Powers</Text>
            {spiritualGifts.map((gift, index) => (
              <div key={index} style={giftContainer}>
                <Text style={giftTitle}>
                  {index + 1}. {gift.name} - {gift.strength}%
                </Text>
                <Text style={paragraph}>{gift.description}</Text>
              </div>
            ))}
            
            <Hr style={divider} />
            
            {/* Summary */}
            <Text style={subheading}>Summary</Text>
            <Text style={paragraph}>{personalizedInsights.summary}</Text>
            
            {/* Call to Action */}
            <Section style={ctaContainer}>
              <Text style={paragraph}>
                View your complete results, including detailed insights and practical applications:
              </Text>
              <Button style={button} href={resultsUrl}>
                View Full Results
              </Button>
            </Section>
            
            <Hr style={divider} />
            
            {/* Community Footer */}
            <Text style={communitySection}>
              Join the Community!
            </Text>
            <Text style={paragraph}>
              Connect with others who have discovered their spiritual gifts and are on a journey of growth and impact. Explore{' '}
              <Link href="https://truthinthewyld.com" style={link}>truthinthewyld.com</Link>{' '}
              to be part of a vibrant community of believers using their spiritual powers for God&apos;s kingdom.
            </Text>
            
            <Hr style={divider} />
            
            <Text style={footer}>
              This email was sent from My Spiritual Powers. Visit{' '}
              <Link href="https://myspiritualpowers.com" style={link}>myspiritualpowers.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const section = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a202c',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#2d3748',
  marginTop: '24px',
  marginBottom: '16px',
};

const communitySection = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#4f46e5',
  marginTop: '24px',
  marginBottom: '12px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4a5568',
  marginBottom: '16px',
};

const giftContainer = {
  marginBottom: '24px',
};

const giftTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#2d3748',
  marginBottom: '8px',
};

const divider = {
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
};

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  textAlign: 'center' as const,
};

const link = {
  color: '#4f46e5',
  textDecoration: 'none',
};

const footer = {
  fontSize: '14px',
  color: '#718096',
  textAlign: 'center' as const,
  marginTop: '32px',
}; 