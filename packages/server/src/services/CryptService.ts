import CryptoJS from "crypto-js";
import forge from 'node-forge';


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

    static async deriveHashes(str: string) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static encryptData(payload: Record<any, any> | string, key: string) {
        if (typeof payload == 'string') return CryptoJS.AES.encrypt(payload, key).toString();
        return CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString()
    }

    static decryptData(cipherpayload: string, key: string) {
        const decryptedText = this.decryptText(cipherpayload, key);
        if (!decryptedText) return null;
        return JSON.parse(decryptedText);
    }

    static decryptText(cipherpayload: string, key: string) {
        try {
            const decryptedText = CryptoJS.AES.decrypt(cipherpayload, key).toString();
            return decryptedText
        } catch (e) {
            throw new Error('decryption faild')
            console.log('decryption faild');
        }
    }

    static createAuthProof(hash: string, challenge: string) {
        const combined = hash + challenge;

        // Und hashen das Ergebnis erneut
        return this.deriveHashes(combined);
    }
}