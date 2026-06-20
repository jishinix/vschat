
export interface DecryptionCollection {
    keys: {
        [userId: string]: string; // "userId": "mit dem jeweiligen PubKey verschlüsselter AES-Key"
    };
    fingerPrint: string
}

export interface EncryptedContent extends DecryptionCollection{
    encryptedContent: string;
}

export interface EncryptedData extends DecryptionCollection{
    encryptedData: Buffer<ArrayBuffer>;
}