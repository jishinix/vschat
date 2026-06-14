
export interface EncryptedContent {
    encryptedContent: string;
    keys: {
        [userId: string]: string; // "userId": "mit dem jeweiligen PubKey verschlüsselter AES-Key"
    };
    fingerPrint: string
}