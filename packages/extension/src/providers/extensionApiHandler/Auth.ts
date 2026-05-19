import { authService } from "../../services/auth/AuthService";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import * as vscode from 'vscode';

function handleAuthRtn(rtn: iReturn) {
    if (rtn.code !== 0 && rtn.code in AuthActionRtnCodesMessageMap) {
        const message = AuthActionRtnCodesMessageMap[rtn.code as keyof typeof AuthActionRtnCodesMessageMap];
        vscode.window.showWarningMessage(message);
    }
    return rtn;
}

export const extensionAuthApi = async (command: string, send: (message: any) => void, data?: Record<string, any>) => {
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
            if (data && data.username && data.password) return send(handleAuthRtn(await authService.register(data.username, data.password)))
            send(new Return(AuthActionRtnCodes.incompleatInformations, missingData));
            break;
        case 'login':
            if (data && data.username && data.password) return send(handleAuthRtn(await authService.login(data.username, data.password)));
            send(new Return(AuthActionRtnCodes.incompleatInformations, missingData));
            break;
        case 'recover':
            if (data && data.username && data.password && data.backupcode) return send(await authService.recover(data.username, data.backupcode, data.newPassword))
            send(false);
            break;
        case 'loginstate':
            if (!!authService.sessionToken) return send(true);
            send(false)

            break;
    }
}