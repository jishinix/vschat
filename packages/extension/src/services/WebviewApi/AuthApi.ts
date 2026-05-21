import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";

function handleAuthRtn(rtn: iReturn) {
    if (rtn.code !== 0 && rtn.code in AuthActionRtnCodesMessageMap) {
        const message = AuthActionRtnCodesMessageMap[rtn.code as keyof typeof AuthActionRtnCodesMessageMap];
        vscode.window.showWarningMessage(message);
    }
    return rtn;
}

export class AuthApi extends NamespaceHandler {
    constructor() {
        super('auth');
    }
    async handle(command: string, data?: Record<string, any>) {
        const missingData: string[] = [];
        switch (command) {
            case 'recover':
                if (!data?.username) missingData.push('username');
                if (!data?.backupcode) missingData.push('backupcode');
                if (!data?.newPassword) missingData.push('newPassword');
                break;
            case 'register':
            case 'login':
                if (!data?.username) missingData.push('username');
                if (!data?.password) missingData.push('password');
                break;
        }
        switch (command) {
            case 'register':
                if (data && data.username && data.password) return handleAuthRtn(await authService.register(data.username, data.password))
                new Return(AuthActionRtnCodes.incompleatInformations, missingData);
                break;
            case 'login':
                if (data && data.username && data.password) return handleAuthRtn(await authService.login(data.username, data.password));
                new Return(AuthActionRtnCodes.incompleatInformations, missingData);
                break;
            case 'recover':
                if (data && data.username && data.password && data.backupcode) return await authService.recover(data.username, data.backupcode, data.newPassword)
                return false;
                break;
            case 'loginstate':
                if (!!authService.sessionToken) return true;
                return false

                break;
        }
    }
}