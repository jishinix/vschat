import CryptoJS from "crypto-js";
import forge from 'node-forge';
import { EncryptedContent } from '@vschat/shared/interfaces/EncryptedContent'
import { UserReference } from '@vschat/shared/interfaces/User'


export class CryptoService {
    static generateRSAKeys() {
        const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

        const privatePem = forge.pki.privateKeyToPem(privateKey);
        const publicPem = forge.pki.publicKeyToPem(publicKey);

        return {
            privateKey: privatePem,
            publicKey: publicPem
        };
    }

    static encryptWithPublicKey(publicKeyPem: string, plainText: string): string {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encryptedBytes = publicKey.encrypt(plainText, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });
        return forge.util.encode64(encryptedBytes);
    }

    static decryptWithPrivateKey(privateKeyPem: string, base64CipherText: string): string {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const encryptedBytes = forge.util.decode64(base64CipherText);
        const decryptedPlaintext = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });

        return decryptedPlaintext;
    }

    static async deriveHashes(str: string) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    static encryptText(str: string, key: string): string {
        return CryptoJS.AES.encrypt(str, key).toString();
    }

    static decryptText(cipherpayload: string, key: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherpayload, key);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) {
                throw new Error('decryption failed - wrong key or corrupted data');
            }

            return decryptedText;
        } catch (e) {
            console.error('decryption failed:', e);
            throw new Error('decryption failed');
        }
    }

    static generateSecureAESKey(): string {
        // 32 Bytes = 256 Bit Schlüsselstärke
        const bytes = forge.random.getBytesSync(32);
        return forge.util.encode64(bytes);
    }

    static createAuthProof(hash: string, challenge: string) {
        const combined = hash + challenge;

        // Und hashen das Ergebnis erneut
        return this.deriveHashes(combined);
    }

    static generateKeyFromContent(content: string): string {
        const md = forge.md.sha256.create();
        md.update(content, 'utf8');
        const hashBytes = md.digest().getBytes();

        return forge.util.encode64(hashBytes);
    }

    static createEncryptedContent(content: string, users: { [userId: string]: UserReference }, key?: string): EncryptedContent {

        key = key || this.generateSecureAESKey();

        const md = forge.md.md5.create();
        md.update(key, 'utf8');
        const keyFingerprint = md.digest().toHex().substring(0, 8);
        return {
            encryptedContent: this.encryptText(content, key),
            keys: Object.fromEntries(Array.from(Object.entries(users)).map(e => [e[0], this.encryptWithPublicKey(e[1].publicKey, key)])),
            fingerPrint: keyFingerprint
        }
    }

    static decryptContent(payload: EncryptedContent, userId: string, privateKey: string, contentKey?: string | null): { content: string, key: string } | null {
        const key = contentKey || this.decryptWithPrivateKey(privateKey, payload.keys[userId]);
        if (!key) return null;

        return { content: this.decryptText(payload.encryptedContent, key), key };
    }

    static decryptMultibleContent(contents: EncryptedContent[], privateKey: string, userId: string) {
        const decryptedKeysMap = new Map<string, string>();

        const rtn = contents.map(e => {
            const encryptedKeyForUser = e.fingerPrint;
            let key = decryptedKeysMap.get(encryptedKeyForUser);
            const decrypted = CryptoService.decryptContent(e, userId, privateKey, key);
            if (!key && decrypted) decryptedKeysMap.set(encryptedKeyForUser, decrypted?.key)
            return decrypted?.content || null
        })
        return rtn;
    }
}