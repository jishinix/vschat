import { ChatList, RawChatListInfos } from "@vschat/shared/interfaces/Chat";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { MessageData } from "@vschat/shared/interfaces/Messages";
import { Message } from "@vschat/shared/models/Message";
import { chatLoader } from "./ChatLoader";
import { WebviewCommunication } from "../WebviewApi/WebviewCommunication";


class GeneralInfosLoader {
    private chatList: Record<string, RawChatListInfos> | null = null;
    private chatListInterval: ReturnType<typeof setInterval> | null = null;

    async getRawChatListInfos() {
        if (this.chatList) return this.chatList;
        this.chatList = (await serverCommunication.chatHandler.getChatListBaseInfos()).chats;
        this.startIntervalReloadChat();
        return this.chatList;
    }

    async newIncommingMessage(message: Message) {
        const list = await this.getRawChatListInfos();
        const chat = list[message.data.chatId];
        if (chat) {
            chat.lastMsgTimestamp = message.data.timestamp;
            chat.unreadedMessages++;
        } else {
            if (!this.chatList) { this.chatList = {} };
            const lastReadedMessage = await serverCommunication.chatHandler.getLastReadedMessage(message.data.chatId)
            this.chatList[message.data.chatId] = {
                unreadedMessages: 1,
                lastMsgTimestamp: message.data.timestamp,
                lastReadedMessageId: lastReadedMessage.messageId
            }
        }
        WebviewCommunication.getInstance()?.chat.sendChatListLookup(await this.getChatList());
    }

    async readChat(chatId: string, lastReadedMessageId: string) {
        const list = await this.getRawChatListInfos();
        const chat = list[chatId];
        if (chat) {
            chat.unreadedMessages = 0;
            chat.lastReadedMessageId = lastReadedMessageId
        }
    }

    private startIntervalReloadChat() {
        if (this.chatListInterval) return;
        this.chatListInterval = setInterval(async () => {
            this.chatList = (await serverCommunication.chatHandler.getChatListBaseInfos()).chats;
        }, 1000 * 60 * 15)
    }

    async getChatList(): Promise<ChatList> {
        const chatList = await generalInfosLoader.getRawChatListInfos();
        const chats = Array.from(
            (await chatLoader.getData(Array.from(Object.keys(chatList)))).values());
        const rtn: ChatList = chats.map(e => {
            if (!e) return null;
            const chatListItem = chatList[e.data.id];
            return { ...e.data, unreadedMsgs: chatListItem.unreadedMessages, lastMsgTimestamp: chatListItem.lastMsgTimestamp, lastReadedMessageId: chatListItem.lastReadedMessageId }
        }).filter(e => e != null)
            .sort((a, b) => b.lastMsgTimestamp - a.lastMsgTimestamp)
        return rtn;
    }
}

export const generalInfosLoader = new GeneralInfosLoader();