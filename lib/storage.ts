import { Storage } from '@google-cloud/storage';

// Initialize storage with credentials from environment variables
// We use specific env vars to avoid needing a JSON key file in Vercel
// Initialize storage
// If env vars are present, use them (Production/Vercel)
// Otherwise, fallback to Application Default Credentials (Local Dev via gcloud auth application-default login)
const storageOptions: any = {
    projectId: process.env.GCP_PROJECT_ID,
};

if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
    storageOptions.credentials = {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
}

const storage = new Storage(storageOptions);

const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'pathways-health-reports';

export async function uploadFile(
    buffer: Buffer,
    destination: string,
    contentType: string = 'application/pdf'
): Promise<string> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(destination);

        await file.save(buffer, {
            metadata: {
                contentType,
            },
        });

        // Make the file public (optional, depends on requirements. For now, we assume private but signed URLs or public bucket)
        // For this MVP, let's assume we want a long-lived public URL or we just return the path.
        // Ideally, we should generate a signed URL for download, but for simplicity:

        // If bucket is public:
        // return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;

        // If we want a signed URL (valid for 1 hour):
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // 1 hour
        });

        return url;

    } catch (error) {
        console.error('Error uploading to GCS:', error);
        throw new Error('Failed to upload file');
    }
}
