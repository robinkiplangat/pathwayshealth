import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `reports/${userId}/${Date.now()}-${file.name}`;

        // Upload to GCS
        const publicUrl = await uploadFile(buffer, filename, file.type);

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 });
    }
}
