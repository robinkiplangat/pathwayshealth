import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const {
        organisationName,
        partnerType,
        geographicFocus,
        countryRegion,
        interestAreas,
        contactPerson,
        workEmail,
        phone,
        website,
        referralSource,
        explorationGoal,
        downloadPitch
    } = body;

    // Initialize Notion client
    const notion = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    // Extract Database ID (handle both raw ID and full URL)
    // Matches a 32-character hex string (Notion UUID format)
    const databaseIdMatch = process.env.NOTION_DATABASE_ID?.match(/([a-f0-9]{32})/i);
    const databaseId = databaseIdMatch ? databaseIdMatch[1] : undefined;

    if (!process.env.NOTION_API_KEY || !databaseId) {
        console.error('Notion Config Error: Missing Key or Invalid Database ID');
        return NextResponse.json(
            { error: 'Notion configuration missing or invalid' },
            { status: 500 }
        );
    }

    try {
        await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                "Organisation Name": {
                    title: [
                        {
                            text: {
                                content: organisationName,
                            },
                        },
                    ],
                },
                "Partner Type": {
                    select: {
                        name: partnerType,
                    },
                },
                "Geographic Focus": {
                    multi_select: geographicFocus.map((geo: string) => ({ name: geo })),
                },
                "Country / Region Details": {
                    rich_text: [
                        {
                            text: {
                                content: countryRegion || '',
                            },
                        },
                    ],
                },
                "Interest Areas": {
                    multi_select: interestAreas.map((area: string) => ({ name: area })),
                },
                "Contact Person": {
                    rich_text: [
                        {
                            text: {
                                content: contactPerson,
                            },
                        },
                    ],
                },
                "Work Email": {
                    email: workEmail,
                },
                "WhatsApp / Phone": {
                    phone_number: phone || null,
                },
                "Website": {
                    url: website || null,
                },
                "How did you hear about Pathways Health?": {
                    rich_text: [
                        {
                            text: {
                                content: referralSource || '',
                            },
                        },
                    ],
                },
                "What would you like to explore with us?": {
                    rich_text: [
                        {
                            text: {
                                content: (explorationGoal || '') + (downloadPitch ? "\n\n[Pitch Deck Requested]" : ""),
                            },
                        },
                    ],
                },
                "Partner Stage": {
                    status: {
                        name: "New inbound",
                    },
                },
                // "Pitch Deck Requested" removed as it doesn't exist in Notion schema
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notion API Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit to Notion' },
            { status: 500 }
        );
    }
}
