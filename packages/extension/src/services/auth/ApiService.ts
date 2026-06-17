import { AuthActionChallangeExtensionRtn, AuthActionLoginExtensionRtn, AuthActionRtnCodes, loginPayload } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { EncryptedMasterkeysPayload } from "./AuthService";
import { ExtensionState } from "../ExtensionState";
import * as vscode from 'vscode';


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class ApiService {

    private static async request<T>(path: string, method: "GET" | "POST", body?: any): Promise<T> {
        try {
            const identifyer = Math.random().toString(36).substring(7);
            const url = `${this.baseUrl}${path}`;
            console.log('[serverRESTApi][extension] send:', identifyer, url, method, body)
            const response = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined
            }).catch(e => {
                vscode.window.showErrorMessage(`Oops! Something went wrong. Cannot connect to "${url}"`);
            });
            if (!response) throw new Error(`Cannot connect to "${url}"`);

            const result = await response.json()
            console.log('[serverRESTApi][extension] resive:', identifyer, result)
            return result as T;
        } catch (e) {
            console.log(e);
        }
        return false as T;
    }

    static get baseUrl() {
        return `${ExtensionState.getPackage().config?.authDomain}/vsc/api`;
    }

    static async register(username: string, hashedPassword: string, publicKey: string, encryptedPrivatekey: string, encryptedMasterkeyPayloads: EncryptedMasterkeysPayload): Promise<Return<AuthActionRtnCodes.userNameAlreadyExists | AuthActionRtnCodes.success, undefined>> {
        const res: any = await this.request("/register", "POST", {
            username,
            hashedPassword,
            publicKey,
            encryptedPrivatekey,
            masterkeyPayload: encryptedMasterkeyPayloads
        });
        return new Return(res.code, res.data);
    }

    static async getLoginChallenge(username: string): Promise<AuthActionChallangeExtensionRtn> {
        const res = await this.request<AuthActionChallangeExtensionRtn>(`/challenge/login/${username}`, "GET");
        return res;
    }

    static async getRecoveryChallenge(username: string): Promise<AuthActionChallangeExtensionRtn> {
        const res = await this.request<AuthActionChallangeExtensionRtn>(`/challenge/recovery/${username}`, "GET");
        return res;
    }

    static async login(solvedChallenge: string, challenge: string, username: string): Promise<AuthActionLoginExtensionRtn> {
        const res = await this.request<AuthActionLoginExtensionRtn>("/login", "POST", { solvedChallenge, challenge, username });
        return res;
    }

    static async validateToken(token: string) {
        const res = await this.request<{ valid: boolean }>('/validateToken', "POST", { token });
        return res.valid;
    }

    static async resetPassword(solvedChallenge: string, challenge: string, username: string, hashedNewPassword: string, newMainSlot: string): Promise<boolean> {
        const res: any = await this.request("/resetpassword", "POST", {
            solvedChallenge,
            challenge,
            username,
            hashedNewPassword,
            newMainSlot
        });
        return res.code === 0;
    }

    static async getEncryptedMasterkeysPayload(username: string): Promise<EncryptedMasterkeysPayload> {
        const res: any = await this.request(`/masterkeys/${username}`, "GET");
        return res.data;
    }
}