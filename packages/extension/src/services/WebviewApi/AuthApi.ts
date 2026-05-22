import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands } from '@vschat/shared/constants/protocolCommands'

function handleAuthRtn(rtn: iReturn) {
    if (rtn.code !== 0 && rtn.code in AuthActionRtnCodesMessageMap) {
        const message = AuthActionRtnCodesMessageMap[rtn.code as keyof typeof AuthActionRtnCodesMessageMap];
        vscode.window.showWarningMessage(message);
    }
    return rtn;
}

export class AuthApi extends NamespaceHandler<typeof extension_webview_authCommands> {
    constructor() {
        super('auth', extension_webview_authCommands);
    }
    handles = {
        recover: async (data) => {
            return await authService.recover(data.username, data.backupcode, data.newPassword)
        },
        login: async (data) => {
            return handleAuthRtn(await authService.login(data.username, data.password));
        },
        register: async (data) => {
            return handleAuthRtn(await authService.register(data.username, data.password))
        },
        loginstate: async (data) => {
            return !!authService.sessionToken;
        }
    } satisfies NamespaceHandler<typeof extension_webview_authCommands>['handles'];

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }
}