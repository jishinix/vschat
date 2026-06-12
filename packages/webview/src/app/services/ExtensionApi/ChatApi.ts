import { inject, Injectable, Injector } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { ChatList } from "@vschat/shared/interfaces/Chat.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js';
import { extension_webview_chatCommands } from '@vschat/shared/constants/protocolCommands'
import { ExtensionBackendCommunication } from './ExtensionBackendCommunication';
import { Message } from '@vschat/shared/interfaces/Messages';

@Injectable({
    providedIn: 'root'
})
export class ChatApi extends NamespaceHandler<typeof extension_webview_chatCommands> {
    private injector = inject(Injector);

    constructor() {
        super('chat', extension_webview_chatCommands)

    }
    handles = {
        resiveMessage: async (data) => {

        }
    } satisfies NamespaceHandler<typeof extension_webview_chatCommands>['handles'];
    private get ebc() {
        return this.injector.get(ExtensionBackendCommunication);
    }
    async getChatList() {
        const chatList = [...(await this.request('getChatList'))]
            .sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp)
        return chatList;
    }

    async startTyping() {
        const user = await this.ebc.user.getLogedInUser();
        if (user.user) {
            this.emit('typing', {
                userId: user.user.id,
                state: true
            })
        }
    }
    async stopTyping() {
        const user = await this.ebc.user.getLogedInUser();
        if (user.user) {
            this.emit('typing', {
                userId: user.user.id,
                state: false
            })
        }
    }

    async sendMsg(message: Message) { this.emit('sendMessage', { message }) }
    async getUserChat(userId: string) { this.emit('getUserChat', { userId }) }
}