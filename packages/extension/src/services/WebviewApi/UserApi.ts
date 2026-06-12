import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_userCommands } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../Loader/UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { UserActionReturnCodes } from "@vschat/shared/interfaces/UserActionInterfaces";
import { lookuptypes } from '@vschat/shared/interfaces/RelationLookuptypes'

export class UserApi extends NamespaceHandler<typeof extension_webview_userCommands> {
    constructor() {
        super('user', extension_webview_userCommands);
    }
    handles = {
        getLogedInUser: async () => {
            const user = (await serverCommunication.userHandler.getLogedInUser())?.webviewData;
            if (!user) return { user: null };
            console.log('USER', user);
            return { user };
        },
        sendFriendRequest: async (data) => {
            const friendRequestReturn = await serverCommunication.userHandler.sendFriendRequest(data.userId);
            if (friendRequestReturn.code === UserActionReturnCodes.success) {
                vscode.window.showInformationMessage(`Es wurde erfolgreich eine Freundesanfrage an ${friendRequestReturn.data.username} (${friendRequestReturn.data.id}) verschickt`);
            } else {
                vscode.window.showErrorMessage(`Fehler(${friendRequestReturn.code}): ${friendRequestReturn.message}`);
            }
            return friendRequestReturn;
        },
        getRelationshipLookup: async (data) => {
            const user = await serverCommunication.userHandler.getLogedInUser();
            if (!user) throw new Error('cant fetch Pending FriendRequests. Not loged in.');
            return { lookup: await user.getRelationLookup(data.lookuptype) };
        },
        getUsers: async (data) => {

            const users = (await userLoader.getData(data.userIds));
            const publicUsers = new Map(
                [...users]
                    .filter(([, user]) => user !== null)
                    .map(([key, user]) => [key, user!.data])
            );
            return { user: Object.fromEntries(publicUsers) || null };
        },
        ignoreFriendRequest: async (data) => {
            return await serverCommunication.userHandler.ignoreFriendRequest(data.userId);
        }
    } satisfies NamespaceHandler<typeof extension_webview_userCommands>['handles'];

    updateRelationLookup(lookup: lookuptypes, users: string[]) {
        this.emit('updateRelationshipLookup', { lookuptype: lookup, lookup: users })
    }

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }
}