import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_chatCommands, extension_webview_updateCommands, extension_webview_userCommands } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../Loader/UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { UserActionReturnCodes } from "@vschat/shared/interfaces/UserActionInterfaces";
import { lookuptypes } from '@vschat/shared/interfaces/RelationLookuptypes'
import { Utils } from '@vschat/shared/Utils/GenerlUtils'
import { chatTypes } from "@vschat/shared/interfaces/Chat";
import { ChatActionReturnCodes } from "@vschat/shared/interfaces/ChatActionInterfaces";
import { chatLoader } from "../Loader/ChatLoader";
import { CryptoService } from '@vschat/shared/Utils/CryptoService'
import { DecrypredMessageData } from '@vschat/shared/interfaces/Messages'
import { UpdateManager } from "../UpdateManager";

export class UpdateApi extends NamespaceHandler<typeof extension_webview_updateCommands> {
    constructor() {
        super('update', extension_webview_updateCommands);
    }
    handles = {
        'download': (data) => {
            UpdateManager.installUpdate()
            return null
        }
    } satisfies NamespaceHandler<typeof extension_webview_updateCommands>['handles'];
}