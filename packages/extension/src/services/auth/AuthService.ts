import { ApiService } from "./ApiService";
import { CryptoService } from '@vschat/shared/Utils/CryptoService'
import { randomBytes } from 'crypto';
import * as CryptoJS from 'crypto-js';
import { AuthActionLoginWebViewRtn, AuthActionRegisterWebViewRtn, AuthActionRtnCodes } from "@vschat/shared/interfaces/ApiInterfaces"
import { Return } from "@vschat/shared/models/Return";
import { WebviewCommunication } from "../WebviewApi/WebviewCommunication";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { TokenStorage } from "./TokenStorage";
import { ExtensionState } from "../ExtensionState";

export interface EncryptedMasterkeysPayload {
    mainSlot: string,
    backupSlots: string[]
    masterkeyProof: string
}


class AuthService {
    sessionToken?: string;
    privateKey?: string;
    masterkey?: string;

    constructor() {
        console.log('INIT');
        const checkToken = () => {
            if (ExtensionState.isDev()) return;
            this.validateToken().then(e => {
                if (e) {
                    WebviewCommunication.getInstance().userFeedback.updateView('init-direct', {})
                }
            })
        }
        if (ExtensionState.contextExists()) {
            checkToken();
        } else {
            ExtensionState.eventDispatcher.addEventListener('initContext', checkToken);
        }
    }

    async register(username: string, password: string): Promise<AuthActionRegisterWebViewRtn> {

        const hashedPassword = await CryptoService.deriveHashes(password);
        const keypair = CryptoService.generateRSAKeys();
        const masterkey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
        const encryptedPrivatekey = CryptoService.encryptText(keypair.privateKey, masterkey);
        const backupCodes = this.generateBackupCodes();
        const encryptedMasterkeysPayloads: EncryptedMasterkeysPayload = {
            mainSlot: CryptoService.encryptText(masterkey, password),
            backupSlots: backupCodes.map(code => CryptoService.encryptText(masterkey, code)),
            masterkeyProof: await CryptoService.deriveHashes(masterkey)
        };
        const apiResult = await ApiService.register(username, hashedPassword, keypair.publicKey, encryptedPrivatekey, encryptedMasterkeysPayloads)
        return apiResult;
    }

    private generateBackupCodes(count: number = 10, length: number = 8): string[] {
        const codes: string[] = [];

        for (let i = 0; i < count; i++) {
            const code = randomBytes(Math.ceil(length / 2))
                .toString('hex')
                .slice(0, length)
                .toUpperCase();

            codes.push(code);
        }

        return codes;
    }

    async login(username: string, password: string): Promise<AuthActionLoginWebViewRtn> {
        const hashedPassword = await CryptoService.deriveHashes(password);
        const challengeRtn = await ApiService.getLoginChallenge(username);
        if (challengeRtn.code !== 0) return challengeRtn;
        const challenge = challengeRtn.data;
        const solvedChallenge = await CryptoService.createAuthProof(hashedPassword, challenge);

        const loginRtn = await ApiService.login(solvedChallenge, challenge, username);
        if (loginRtn.code !== 0) return loginRtn;

        const loginPayload = loginRtn.data;

        this.sessionToken = loginPayload.sessionToken;
        this.masterkey = CryptoService.decryptText(loginPayload.encryptedMasterkeyMainSlot, password);
        this.privateKey = CryptoService.decryptText(loginPayload.encryptedPrivatekey, this.masterkey);
        serverCommunication.connect(this.sessionToken);
        await TokenStorage.saveToken(this.sessionToken, this.masterkey, this.privateKey);
        return new Return(AuthActionRtnCodes.success, undefined);
    }

    async validateToken() {
        const token = await TokenStorage.getToken();
        if (!token) return false;

        const validation = await ApiService.validateToken(token.token);
        if (validation) {
            this.sessionToken = token.token;
            this.masterkey = token.masterKey;
            this.privateKey = token.privateKey;
            serverCommunication.connect(this.sessionToken);
        }
        return validation;
    }

    async recover(username: string, backupcode: string, newPassword: string) {
        const encryptedMasterkeysPayloads = await ApiService.getEncryptedMasterkeysPayload(username);
        const masterkey = await this.findMasterKey(encryptedMasterkeysPayloads, backupcode)
        const hashedNewPassword = await CryptoService.deriveHashes(newPassword);
        if (!masterkey) return false;

        const hashedMasterkey = await CryptoService.deriveHashes(masterkey);
        const challengeRtn = await ApiService.getLoginChallenge(username);
        if (challengeRtn.code !== 0) return challengeRtn;
        const challenge = challengeRtn.data;
        const solvedChallenge = await CryptoService.createAuthProof(hashedMasterkey, challenge);
        const newMainSlot = CryptoService.encryptText(masterkey, newPassword);

        const succsess = await ApiService.resetPassword(solvedChallenge, challenge, username, hashedNewPassword, newMainSlot)
        return succsess;
    }

    private async findMasterKey(encryptedMasterkeysPayloads: EncryptedMasterkeysPayload, backupcode: string) {
        for (const encryptedMasterkey of encryptedMasterkeysPayloads.backupSlots) {
            const decryptedMasterKey = CryptoService.decryptText(encryptedMasterkey, backupcode);
            if (decryptedMasterKey && encryptedMasterkeysPayloads.masterkeyProof === await CryptoService.deriveHashes(decryptedMasterKey)) {
                return decryptedMasterKey;
            }
        }
        return null;
    }
}

export const authService = new AuthService();