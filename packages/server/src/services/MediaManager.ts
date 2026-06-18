import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class MediaManager {
    private client = new S3Client({
        endpoint: "http://localhost:9000/vsc/media",
        region: "us-east-1",
        credentials: {
            accessKeyId: "admin_patrick",
            secretAccessKey: "mein_ganz_sicheres_passwort",
        },
        forcePathStyle: true,
    });

    constructor() { }

    async generateUploadUrl(id: string, bucketName: 'chat-attachments' = 'chat-attachments'): Promise<string> {

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