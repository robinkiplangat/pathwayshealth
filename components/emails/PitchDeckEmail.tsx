import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
    Img,
} from '@react-email/components';

interface PitchDeckEmailProps {
    name?: string;
}

export const PitchDeckEmail = ({
    name,
}: PitchDeckEmailProps) => {
    const previewText = `Here is the Pathways Health investment pitch deck you requested.`;
    const pitchDeckUrl = 'https://pathways.fourbic.com/api/download-pitch';

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Building a Resilient Future</Heading>

                    <Text style={text}>
                        {name ? `Hi ${name},` : 'Hello,'}
                    </Text>

                    <Text style={text}>
                        Thank you so much for your interest in <strong>Pathways Health</strong>. We are thrilled to share our vision for a climate-resilient healthcare infrastructure with you.
                    </Text>

                    <Text style={text}>
                        At Pathways, we believe that healthcare facilities are the cornerstone of community resilience. Our mission is to empower these vital institutions to withstand and recover from the increasing challenges posed by climate change.
                    </Text>

                    <Text style={text}>
                        Attached below is our investment pitch deck, which outlines our strategy, our impact, and the opportunity for you to join us in making a tangible difference.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={pitchDeckUrl}>
                            Download Pitch Deck
                        </Button>
                    </Section>

                    <Text style={text}>
                        We would love to hear your thoughts and discuss how we can collaborate to build a safer, healthier future.
                    </Text>

                    <Text style={text}>
                        Warm regards,<br />
                        The Pathways Health Team
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Pathways Health - Climate Resilience for Healthcare Facilities<br />
                        <a href="https://pathways.fourbic.com" style={link}>pathways.fourbic.com</a>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    color: '#1a1a1a',
    textAlign: 'center' as const,
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
};

const link = {
    color: '#2563eb',
    textDecoration: 'underline',
};

export default PitchDeckEmail;
