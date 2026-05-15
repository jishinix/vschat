import { authService } from "../../services/auth/AuthService";
import { Return } from "@vschat/shared/models/Return";
import { AuthActionRtnCodes } from "@vschat/shared/interfaces/ApiInterfaces";

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
            if (data && data.username && data.password) send(await authService.register(data.username, data.password))
            send(new Return(AuthActionRtnCodes.incompleatInformations, missingData));
            break;
        case 'login':
            if (data && data.username && data.password) send(await authService.login(data.username, data.password))
            send(new Return(AuthActionRtnCodes.incompleatInformations, missingData));
            break;
        case 'recover':
            if (data && data.username && data.password && data.backupcode) send(await authService.recover(data.username, data.backupcode, data.newPassword))
            send(false);
            break;
        case 'loginstate':
            if (!!authService.sessionToken) send(true);
            send(false)

            break;
    }
}