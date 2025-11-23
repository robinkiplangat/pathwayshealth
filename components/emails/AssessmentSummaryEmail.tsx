import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components';

interface AssessmentSummaryEmailProps {
    facilityName: string;
    score?: number;
    reportUrl: string;
}

export const AssessmentSummaryEmail = ({
    facilityName,
    score,
    reportUrl,
}: AssessmentSummaryEmailProps) => {
    const previewText = `Your assessment report for ${facilityName} is ready.`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Assessment Complete</Heading>
                    <Text style={text}>
                        Hello,
                    </Text>
                    <Text style={text}>
                        Your climate resilience assessment for <strong>{facilityName}</strong> has been successfully saved.
                    </Text>

                    {score !== undefined && score > 0 && (
                        <Section style={scoreSection}>
                            <Text style={scoreLabel}>Overall Resilience Score</Text>
                            <Heading style={scoreValue}>{score}/100</Heading>
                        </Section>
                    )}

                    <Text style={text}>
                        You can view your full report, including detailed action plans and recommendations, by clicking the button below.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={reportUrl}>
                            View Full Report
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Pathways Health - Climate Resilience for Healthcare Facilities
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

const scoreSection = {
    textAlign: 'center' as const,
    margin: '32px 0',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
};

const scoreLabel = {
    color: '#666',
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 8px',
};

const scoreValue = {
    color: '#2563eb',
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0',
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

export default AssessmentSummaryEmail;
