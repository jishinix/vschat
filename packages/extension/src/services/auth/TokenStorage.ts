import { ExtensionState } from "../ExtensionState";
import * as vscode from 'vscode'

interface AuthData {
    token: string,
    masterKey: string,
    privateKey: string
}

export class TokenStorage {

    static get context() {
        return ExtensionState.getContext()
    }

    static async saveToken(token: string, masterKey: string, privateKey: string) {
        try {
            await this.context.secrets.store('vschat.authToken', JSON.stringify({ token, masterKey, privateKey }));
        } catch (error) {
            vscode.window.showErrorMessage('Fehler beim Speichern des Logins: ' + error);
        }
    }

    static async getToken() {
        const authData = await this.context.secrets.get('vschat.authToken');
        if (!authData) return null;

        return JSON.parse(authData) as AuthData;
    }

    static async deleteToken() {
        await this.context.secrets.delete('vschat.authToken');
    }
}