import { extension_webview_authCommands, extension_webview_userCommands } from "@vschat/shared/constants/protocolCommands"
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { lookuptypes } from "@vschat/shared/interfaces/RelationLookuptypes";
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js'
import { using } from "rxjs";
import { AccountStorage } from "../AccountStorage";
import { inject, Injector } from "@angular/core";


export class UserApi extends NamespaceHandler<typeof extension_webview_userCommands> {
    private injector = inject(Injector);
    constructor() {
        super('user', extension_webview_userCommands)
    }
    handles = {
        updateRelationshipLookup: async (data) => {
            const as = this.injector.get(AccountStorage);
            as.addRelationship(data.lookuptype, data.lookup);
            return null;
        }
    } satisfies NamespaceHandler<typeof extension_webview_userCommands>['handles'];

    async getLogedInUser() {
        return await this.request('getLogedInUser');
    }

    async sendFriendRequest(userId: string) {
        return await this.request('sendFriendRequest', { userId });
    }

    async ignoreFriendRequest(userId: string) {
        return await this.request('ignoreFriendRequest', { userId });
    }

    async getRelationLookup(lookuptype: lookuptypes) {
        return this.request('getRelationshipLookup', { lookuptype: lookuptype })
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
