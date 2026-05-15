import { ExtensionAPIBase } from "./ApiBase.js";
import type { AuthActionRegisterRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"


class AuthApi extends ExtensionAPIBase {
    constructor() {
        super('auth')
    }
    async getLoginState() {
        return await this.request<boolean>('loginstate')
    }
    async register(username: string, password: string) {
        return await this.request<AuthActionRegisterRtn>('register', { username, password })
    }

    async login(username: string, password: string) {
        return await this.request('login', { username, password })
    }

    async recover(username: string, backupcode: string, newPassword: string) {
        return await this.request('recover', { username, backupcode, newPassword })
    }
}


export const authApi = new AuthApi();