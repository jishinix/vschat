import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_userCommands, extension_webview_userFeedbackEmits } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../Loader/UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";

export class UserFeedbackEmits extends NamespaceHandler<typeof extension_webview_userFeedbackEmits> {
    constructor() {
        super('userFeedback', extension_webview_userFeedbackEmits);
    }
    handles = {
        UUIDCopied: () => {
            vscode.window.showInformationMessage('UUID wurde in die zwichenablage Kopiert.');
            return null
        }
    } satisfies NamespaceHandler<typeof extension_webview_userFeedbackEmits>['handles'];

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }
}