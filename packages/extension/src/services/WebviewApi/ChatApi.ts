import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { iReturn, Return } from "@vschat/shared/models/Return";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import * as vscode from 'vscode';
import { authService } from "../auth/AuthService";
import { extension_webview_authCommands, extension_webview_chatCommands, extension_webview_userCommands } from '@vschat/shared/constants/protocolCommands'
import { userLoader } from "../Loader/UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { UserActionReturnCodes } from "@vschat/shared/interfaces/UserActionInterfaces";
import { lookuptypes } from '@vschat/shared/interfaces/RelationLookuptypes'
import { Utils } from '@vschat/shared/Utils/GenerlUtils'
import { ChatList, ChatListItem, chatTypes } from "@vschat/shared/interfaces/Chat";
import { ChatActionReturnCodes } from "@vschat/shared/interfaces/ChatActionInterfaces";
import { chatLoader } from "../Loader/ChatLoader";
import { CryptoService } from '@vschat/shared/Utils/CryptoService'
import { DecrypredMessageData } from '@vschat/shared/interfaces/Messages'
import { generalInfosLoader } from "../Loader/GeneralInfosLoader";
import { UserReference } from "@vschat/shared/interfaces/User";

export class ChatApi extends NamespaceHandler<typeof extension_webview_chatCommands> {
    constructor() {
        super('chat', extension_webview_chatCommands);
    }
    handles = {
        'getFriendChat': async (data) => {
            const user = await serverCommunication.userHandler.getLogedInUser();
            if (!user) return { chat: null };
            const chatId = Utils.generateDirectChatId(user.data.id, data.userId);;
            let chat = (await chatLoader.getData([chatId])).get(chatId)?.data;
            if (!chat) {
                const rtn = (await serverCommunication.chatHandler.createChat({
                    name: '',
                    participants: [user.data.id, data.userId],
                    type: chatTypes.direct
                })).chat;
                if (rtn.code !== ChatActionReturnCodes.success) {
                    return { chat: null }
                }
                chat = rtn.data;
            }

            if (!chat) return { chat: null };
            return { chat: chat };
        },
        'getChats': async (data) => {
            return { chats: Utils.MapToRecord(await chatLoader.getData(data.chatIds)) };
        },
        'fetchMessages': async (data) => {
            const chat = (await chatLoader.getData([data.chatId])).get(data.chatId);
            if (!chat) return { messages: [] };
            return { messages: (await chat.messageLoader.fetch(data.max, data.lastMessageId)).map(e => e.data) };
        },
        'sendMessage': async (data) => {
            const chat = (await chatLoader.getData([data.message.chatId])).get(data.message.chatId);
            if (!chat) return null;
            const chatSessionKey = CryptoService.generateKeyFromContent(await serverCommunication.authHander.getChatSession() + chat.data.id);
            const encryptedContent = CryptoService.createEncryptedContent(data.message.content, Object.fromEntries(chat.data.participants.map(e => [e.id, e])), chatSessionKey)
            console.log('ENCRYPTED', encryptedContent.keys)
            serverCommunication.chatHandler.sendMsg({ ...data.message, encryptedContent })
            return null
        },
        'getChatList': async (data) => {
            return await generalInfosLoader.getChatList();
        },
        'requestChatMarkingRead': async (data) => {
            serverCommunication.chatHandler.markChatsAsRead(data.chatId);
            return null;
        },
        'getLastReadedMessage': async (data) => {
            return await serverCommunication.chatHandler.getLastReadedMessage(data.chatId)
        }
    } satisfies NamespaceHandler<typeof extension_webview_chatCommands>['handles'];

    reciveMessage(msg: DecrypredMessageData) {
        this.emit('reciveMessage', { message: msg });
    }

    sendChatListLookup(chats: ChatList) {
        this.emit('sendChatListLookup', chats)
    }

    markChatAsReaded(chatId: string, messageId: string) {
        this.emit('markChatAsReaded', { chatId, messageId })
    }
}