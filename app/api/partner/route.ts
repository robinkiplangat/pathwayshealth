import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { name, contact, contactMethod, downloadPitch } = body;

    // Initialize Notion client
    const notion = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!process.env.NOTION_API_KEY || !databaseId) {
        return NextResponse.json(
            { error: 'Notion configuration missing' },
            { status: 500 }
        );
    }

    try {
        await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: name,
                            },
                        },
                    ],
                },
                "Contact Method": {
                    select: {
                        name: contactMethod === 'email' ? 'Email' : 'Phone',
                    },
                },
                "Contact Details": {
                    rich_text: [
                        {
                            text: {
                                content: contact,
                            },
                        },
                    ],
                },
                "Pitch Deck Requested": {
                    checkbox: downloadPitch,
                },
                "Status": {
                    status: {
                        name: "New Inquiry"
                    }
                }
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
