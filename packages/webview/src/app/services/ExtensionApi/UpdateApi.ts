import { inject, Injectable, Injector } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { ChatList } from "@vschat/shared/interfaces/Chat.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js';
import { extension_webview_chatCommands, extension_webview_updateCommands } from '@vschat/shared/constants/protocolCommands'
import { ExtensionBackendCommunication } from './ExtensionBackendCommunication';
import { DecrypredMessageCreateData, MessageData } from '@vschat/shared/interfaces/Messages';
import { NavigationService } from '../NavigationService';

@Injectable({
    providedIn: 'root'
})
export class UpdateApi extends NamespaceHandler<typeof extension_webview_updateCommands> {
    private injector = inject(Injector);

    constructor() {
        super('update', extension_webview_updateCommands)

    }
    handles = {
    } satisfies NamespaceHandler<typeof extension_webview_updateCommands>['handles'];

    update() {
        this.emit('download')
    }
}