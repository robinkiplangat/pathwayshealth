import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    try {
        // Read the PDF file from the public directory
        const pdfPath = join(process.cwd(), 'public', 'PathwaysHealth_Resilience.pdf');
        const pdfBuffer = await readFile(pdfPath);

        // Return the PDF with proper headers
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="PathwaysHealth_Resilience.pdf"',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error downloading PDF:', error);
        return NextResponse.json(
            { error: 'Failed to download PDF' },
            { status: 500 }
        );
    }
}
