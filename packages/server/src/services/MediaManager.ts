import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type buckets = 'chat-attachments';

export class MediaManager {
    private client = new S3Client({
        endpoint: `http://localhost:${process.env.MINIO_PORT}/vsc/media`,
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.MINIO_ADMIN_USER as string,
            secretAccessKey: process.env.MINIO_ADMIN_PASSWORD as string,
        },
        forcePathStyle: true,
    });

    constructor() { }

    async generateAccessUrl(id: string, bucketName: buckets = 'chat-attachments'){
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: id,
        });

        const url = await getSignedUrl(this.client, command, {
            expiresIn: 15 * 60 // 15 min
        });

        return url;
    }

    async generateUploadUrl(id: string, bucketName: buckets = 'chat-attachments'): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: id,
        });

        const url = await getSignedUrl(this.client, command, {
            expiresIn: 5 * 60 // 5 Minuten Gültigkeit
        });

        return url;
    }
}