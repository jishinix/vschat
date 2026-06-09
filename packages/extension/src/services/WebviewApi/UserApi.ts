import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_userCommands } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";

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
        }
    } satisfies NamespaceHandler<typeof extension_webview_userCommands>['handles'];

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }
}