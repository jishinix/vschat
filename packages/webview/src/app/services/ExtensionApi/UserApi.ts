import { extension_webview_authCommands, extension_webview_userCommands } from "@vschat/shared/constants/protocolCommands"
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js'
import { using } from "rxjs";


export class UserApi extends NamespaceHandler<typeof extension_webview_userCommands> {
    constructor() {
        super('user', extension_webview_userCommands)
    }
    handles = {} satisfies NamespaceHandler<typeof extension_webview_authCommands>['handles'];

    async getLogedInUser() {
        return await this.request('getLogedInUser');
    }

    async getFriends() {
        return await this.request('getFriends');
    }

    async getPendingRequests() {
        return await this.request('getPendingRequests');
    }

    async getUsers(userIds: string[]) {
        return await this.request('getUsers', { userIds });
    }

    async hasBlocked(userId: string) {
        return await this.request('hasBlocked', { userId });
    }

    async hasPendingFriendRequest(userId: string) {
        return await this.request('hasPendingFriendRequest', { userId });
    }

    async isBlockedBy(userId: string) {
        return await this.request('isBlockedBy', { userId });
    }
}
