import * as Minio from 'minio';

export type buckets = 'chat-attachments';

class MediaManager {
    private client = new Minio.Client({
        endPoint: process.env.STORAGE_ENDPOINT as string,
        port: parseInt(process.env.STORAGE_PORT as string),
        useSSL: false,
        accessKey: process.env.STORAGE_ACCESS_KEY as string,
        secretKey: process.env.STORAGE_SECRET_KEY as string,
        pathStyle: true
    });

    private publicClient = new Minio.Client({
        endPoint: process.env.PUBLIC_STORAGE_HOST as string,
        port: parseInt(process.env.PUBLIC_STORAGE_PORT as string),
        useSSL: process.env.PUBLIC_STORAGE_SSL === 'true',
        accessKey: process.env.STORAGE_ACCESS_KEY as string,
        secretKey: process.env.STORAGE_SECRET_KEY as string,
        pathStyle: true,
        region: 'us-east-1'
    });

    private initializedBuckets = new Set<string>();

    constructor() {
        // Buckets beim Start initialisieren
        this.ensureBucketExists('chat-attachments').catch(console.error);
    }

    private async ensureBucketExists(bucketName: string) {
        if (this.initializedBuckets.has(bucketName)) return;
        const exists = await this.client.bucketExists(bucketName);
        if (!exists) {
            await this.client.makeBucket(bucketName, 'us-east-1');
        }
        this.initializedBuckets.add(bucketName);
    }

    async exists(id: string, bucketName: buckets = 'chat-attachments'): Promise<boolean> {
        await this.ensureBucketExists(bucketName);
        try {
            await this.client.statObject(bucketName, id);
            return true;
        } catch {
            return false;
        }
    }

    async generateAccessUrl(id: string, bucketName: buckets = 'chat-attachments'): Promise<string> {
        await this.ensureBucketExists(bucketName);
        return this.publicClient.presignedGetObject(bucketName, id, 900);
    }

    async generateUploadUrl(id: string, bucketName: buckets = 'chat-attachments'): Promise<string> {
        await this.ensureBucketExists(bucketName);
        return this.publicClient.presignedPutObject(bucketName, id, 300);
    }
}

export const mediaManager = new MediaManager();