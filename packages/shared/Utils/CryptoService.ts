import { 
    randomBytes, 
    createCipheriv, 
    createDecipheriv, 
    generateKeyPairSync, 
    publicEncrypt, 
    privateDecrypt, 
    constants, 
    createHash,
    scryptSync 
} from 'node:crypto';
import { EncryptedContent, EncryptedData } from '../interfaces/EncryptedContent';
import { UserReference } from '../interfaces/User';

export class CryptoService {
    private static contentToKeyCache = new Map<string, string>()
    private static decryptedKeysCache = new Map<string, string>()

    // --- Original Methoden (Beibehalten) ---

    static generateRSAKeys() {
        const { privateKey, publicKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        return { privateKey, publicKey };
    }

    static encryptWithPublicKey(publicKeyPem: string, plainText: string): string {
        const buffer = Buffer.from(plainText, 'utf-8');
        const encrypted = publicEncrypt({
            key: publicKeyPem,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, buffer);
        return encrypted.toString('base64');
    }

    static decryptWithPrivateKey(privateKeyPem: string, base64CipherText: string): string {
        const buffer = Buffer.from(base64CipherText, 'base64');
        const decrypted = privateDecrypt({
            key: privateKeyPem,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, buffer);
        return decrypted.toString('utf-8');
    }

    static async deriveHashes(str: string): Promise<string> {
        return createHash('sha256').update(str).digest('hex');
    }

    static encryptText(str: string, key: string): string {
        const aesKey = Buffer.from(key, 'base64');
        const contentBuffer = Buffer.from(str, 'utf-8');
        const encrypted = this.encryptBuffer(contentBuffer, aesKey);
        return encrypted.toString('base64');
    }

    static encryptData(data: Buffer<ArrayBuffer>, key: string): Buffer<ArrayBuffer> {
        const aesKey = Buffer.from(key, 'base64');
        return this.encryptBuffer(data, aesKey);
    }

    static decryptText(cipherpayload: string, key: string): string {
        const aesKey = Buffer.from(key, 'base64');
        const buffer = Buffer.from(cipherpayload, 'base64');
        return this.decryptBuffer(buffer, aesKey).toString('utf-8');
    }

    static generateSecureAESKey(): string {
        return randomBytes(32).toString('base64');
    }

    static createAuthProof(hash: string, challenge: string): Promise<string> {
        return this.deriveHashes(hash + challenge);
    }
        
    static generateKeyFromContent(content: string): string {
        if(this.contentToKeyCache.has(content)) return this.contentToKeyCache.get(content)!
        const salt = createHash('sha256').update(content).digest('hex').substring(0, 16);
        const derivedKey = scryptSync(content, salt, 32);
        const key = derivedKey.toString('base64');
        this.contentToKeyCache.set(content, key);
        return key;
    }

    // --- Interne Helper (Nativ) ---

    private static encryptBuffer(buffer: Buffer<ArrayBuffer>, key: Buffer): Buffer<ArrayBuffer> {
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, tag, encrypted]);
    }

    private static decryptBuffer(encryptedBuffer: Buffer<ArrayBuffer>, key: Buffer): Buffer<ArrayBuffer> {
        const iv = encryptedBuffer.subarray(0, 12);
        const tag = encryptedBuffer.subarray(12, 28);
        const data = encryptedBuffer.subarray(28);
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }

    // --- Die von dir gewünschten Methoden ---

    static createEncryptedContent(content: string, users: { [userId: string]: UserReference }, key?: string): EncryptedContent {
        const aesKeyString = key || this.generateSecureAESKey();
        const aesKeyBuffer = Buffer.from(aesKeyString, 'base64');
        
        const encryptedContent = this.encryptText(content, aesKeyString);
        
        return {
            encryptedContent,
            keys: Object.fromEntries(
                Object.entries(users).map(([id, user]) => [id, this.encryptWithPublicKey(user.publicKey, aesKeyString)])
            ),
            fingerPrint: createHash('md5').update(aesKeyBuffer).digest('hex').substring(0, 8)
        };
    }

    static createEncryptedData(content: Buffer<ArrayBuffer>, users: { [userId: string]: UserReference }, key?: string): EncryptedData {
        const aesKeyString = key || this.generateSecureAESKey();
        const encryptedData = this.encryptData(content, aesKeyString);
        
        return {
            encryptedData,
            keys: Object.fromEntries(
                Object.entries(users).map(([id, user]) => [id, this.encryptWithPublicKey(user.publicKey, aesKeyString)])
            ),
            fingerPrint: createHash('md5').update(Buffer.from(aesKeyString, 'base64')).digest('hex').substring(0, 8)
        };
    }

    static decryptContent(payload: EncryptedContent, userId: string, privateKey: string): { content: string, key: string } | null {
        const key = this.decryptedKeysCache.get(payload.fingerPrint) || this.decryptWithPrivateKey(privateKey, payload.keys[userId]);
        if (!key) return null;
        this.decryptedKeysCache.set(payload.fingerPrint, key);
        return { content: this.decryptText(payload.encryptedContent, key), key };
    }

    static decryptMultibleContent(contents: EncryptedContent[], privateKey: string, userId: string) {
        return contents.map(e => {
            const decrypted = this.decryptContent(e, userId, privateKey);
            return decrypted?.content || null;
        });
    }
}