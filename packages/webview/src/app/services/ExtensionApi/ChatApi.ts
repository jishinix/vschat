import { Injectable } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { ChatList } from "@vschat/shared/interfaces/Chat.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js';
import { extension_webview_chatCommands } from '@vschat/shared/constants/protocolCommands'

@Injectable({
    providedIn: 'root'
})
export class ChatApi extends NamespaceHandler<typeof extension_webview_chatCommands> {
    constructor() {
        super('chat', extension_webview_chatCommands)
    }
    override handles = {};
    async getChatList() {
        const chatList = [...(await this.request('getChatList'))]
            .sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp)
        return chatList;
    }
}