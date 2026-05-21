import { Injectable } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { ChatList } from "@vschat/shared/interfaces/Chat.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js';

@Injectable({
    providedIn: 'root'
})
export class ChatApi extends NamespaceHandler {
    constructor() {
        super('chat')
    }
    handle(command: string, data?: Record<string, any>) {

    }
    async getChatList() {
        const chatList = (await this.request<ChatList>('getChatList'))
            .sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp)
        return chatList;
    }
}