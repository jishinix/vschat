import { ExtensionAPIBase } from "./ApiBase.js";
import { Injectable } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"

@Injectable({
    providedIn: 'root'
})
export class AuthApi extends ExtensionAPIBase {
    constructor() {
        super('auth')
    }
    async getLoginState() {
        return await this.request<boolean>('loginstate')
    }
    async register(username: string, password: string) {
        return await this.request<AuthActionRegisterWebViewRtn>('register', { username, password })
    }

    async login(username: string, password: string) {
        return await this.request<AuthActionLoginWebViewRtn>('login', { username, password })
    }

    async recover(username: string, backupcode: string, newPassword: string) {
        return await this.request('recover', { username, backupcode, newPassword })
    }
}