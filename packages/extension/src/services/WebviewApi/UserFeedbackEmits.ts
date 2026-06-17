import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_userCommands, extension_webview_userFeedbackEmits } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../Loader/UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { webViewNavigationStorage } from "../WebViewNavigationStorage";
import { AppViews, NavigationData } from "@vschat/shared/interfaces/WebViewNavigation";

export class UserFeedbackEmits extends NamespaceHandler<typeof extension_webview_userFeedbackEmits> {
    constructor() {
        super('userFeedback', extension_webview_userFeedbackEmits);
    }
    handles = {
        'UUIDCopied': () => {
            vscode.window.showInformationMessage('UUID wurde in die zwichenablage Kopiert.');
            return null
        },
        'ViewUpdate': (data) => {
            webViewNavigationStorage.updateView(data.view, data.navigationData);
            return null
        }
    } satisfies NamespaceHandler<typeof extension_webview_userFeedbackEmits>['handles'];

    handleIncompleteInformations(command: string, missing: string[]) {
        return new Return(AuthActionRtnCodes.incompleatInformations, missing);
    }

    updateView(view: AppViews, navigationData: Partial<NavigationData>) {
        this.emit('updateView', { view, navigationData })
    }
}