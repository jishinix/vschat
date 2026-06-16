import { inject, Injectable, Injector } from '@angular/core';
import { type AuthActionLoginWebViewRtn, type AuthActionRegisterWebViewRtn } from "@vschat/shared/interfaces/ApiInterfaces.js"
import { ChatList } from "@vschat/shared/interfaces/Chat.js"
import { NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper.js';
import { extension_webview_chatCommands } from '@vschat/shared/constants/protocolCommands'
import { ExtensionBackendCommunication } from './ExtensionBackendCommunication';
import { DecrypredMessageCreateData, MessageData } from '@vschat/shared/interfaces/Messages';
import { NavigationService } from '../NavigationService';

// hier wird viel mit dem eventdispatcher gearbeitet die views und componenten hängen sich einfach ran statt alles durch zu hangeln

export class ChatApi extends NamespaceHandler<typeof extension_webview_chatCommands> {
    private injector = inject(Injector);

    constructor() {
        super('chat', extension_webview_chatCommands)

    }
    handles = {
    } satisfies NamespaceHandler<typeof extension_webview_chatCommands>['handles'];
    private get navigation() {
        return this.injector.get(NavigationService)
    }
    private get ebc() {
        return this.injector.get(ExtensionBackendCommunication);
    }
    async getChatList() {
        const chatList = [...(await this.request('getChatList'))]
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

    async getFriendChat(userId: string) {
        return this.request('getFriendChat', { userId });
    }

    async getChat(chatId: string) {
        return (await this.request('getChats', { chatIds: [chatId] })).chats[chatId]
    }

    async markAsReadedChat(chatId: string) {
        this.request('requestChatMarkingRead', { chatId });
    }

    async getMessages(chatId: string, messageIds: string[]) { return await this.request('getMessages', { chatId, messageIds }); }
    async fetchMessages(chatId: string, max: number = 50, lastMessageId: string | null = null) { return await this.request('fetchMessages', { chatId, max, lastMessageId }); }

    async sendMsg(message: DecrypredMessageCreateData) { this.emit('sendMessage', { message }) }

    async getLastReadedMessage(chatId: string) { return this.request('getLastReadedMessage', { chatId }) }
}