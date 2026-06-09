import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_userCommands } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { UserActionReturnCodes } from "@vschat/shared/interfaces/UserActionInterfaces";

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
    } satisfies NamespaceHandler<typeof extension_webview_userCommands>['handles'];

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }
}