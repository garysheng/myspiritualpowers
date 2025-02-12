import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Button,
  Img,
} from '@react-email/components';

interface InviteEmailProps {
  inviterName: string;
  inviterArchetype: string;
  customMessage?: string;
  inviteUrl: string;
  archetypeImageUrl: string;
}

export const InviteEmail = ({
  inviterName,
  inviterArchetype,
  customMessage,
  inviteUrl,
  archetypeImageUrl,
}: InviteEmailProps) => {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Discover Your Spiritual Powers</Text>
            
            {/* Inviter's Message */}
            <Text style={paragraph}>
              {inviterName} has invited you to discover your spiritual gifts! They recently completed our assessment and discovered their Spiritual Power Archetype:
            </Text>
            
            {/* Archetype Image */}
            <div style={imageContainer}>
              <Img 
                src={archetypeImageUrl}
                alt={`${inviterName}'s Spiritual Power Archetype: ${inviterArchetype}`}
                width="400"
                height="400"
                style={image}
              />
            </div>

            {/* Custom Message */}
            {customMessage && (
              <>
                <Hr style={divider} />
                <Section style={messageSection}>
                  <Text style={messageText}>
                    A personal message from {inviterName}:
                  </Text>
                  <Text style={customMessageText}>
                    "{customMessage}"
                  </Text>
                </Section>
                <Hr style={divider} />
              </>
            )}
            
            {/* Call to Action */}
            <Section style={ctaContainer}>
              <Text style={paragraph}>
                Ready to discover your unique spiritual gifts and divine purpose?
              </Text>
              <Button style={button} href={inviteUrl}>
                Take the Assessment
              </Button>
            </Section>
            
            <Hr style={divider} />
            
            {/* About Section */}
            <Text style={paragraph}>
              The Spiritual Powers Assessment is a comprehensive tool that helps you:
            </Text>
            <ul style={list}>
              <li>Discover your unique spiritual gifts</li>
              <li>Understand your divine purpose</li>
              <li>Find practical ways to use your gifts</li>
              <li>Connect with others in meaningful ministry</li>
            </ul>
            
            <Hr style={divider} />
            
            <Text style={footer}>
              This invitation was sent through My Spiritual Powers. Visit{' '}
              <Link href="https://myspiritualpowers.com" style={link}>
                myspiritualpowers.com
              </Link>
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

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4a5568',
  marginBottom: '16px',
};

const imageContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const image = {
  borderRadius: '8px',
  maxWidth: '100%',
  height: 'auto',
};

const messageSection = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const messageText = {
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '8px',
};

const customMessageText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1a202c',
  fontStyle: 'italic',
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

const list = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '24px',
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