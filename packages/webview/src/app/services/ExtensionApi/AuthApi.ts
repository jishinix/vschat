import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js'


export class AuthApi extends NamespaceHandler {
    constructor() {
        super('auth')
    }
    handle(command: string, data?: Record<string, any> | undefined): any | Promise<any> {

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