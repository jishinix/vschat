import { extension_webview_authCommands } from "@vschat/shared/constants/protocolCommands"
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js'


export class AuthApi extends NamespaceHandler<typeof extension_webview_authCommands> {
    constructor() {
        super('auth', extension_webview_authCommands)
    }
    handles = {} satisfies NamespaceHandler<typeof extension_webview_authCommands>['handles'];

    async getLoginState() {
        return await this.request('loginstate')
    }
    async register(username: string, password: string) {
        return await this.request('register', { username, password })
    }
    async login(username: string, password: string) {
        return await this.request('login', { username, password })
    }
    async recover(username: string, backupcode: string, newPassword: string) {
        return await this.request('recover', { username, backupcode, newPassword })
    }
}