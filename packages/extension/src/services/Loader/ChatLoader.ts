import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Chat } from '@vschat/shared/models/Chat';
import { Cache } from "@vschat/shared/Utils/Cache";
import { MessagesLoader } from "./MessagesLoader";
import { userLoader } from "./UserLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";


class ChatLoader extends Cache<ChatData, Chat<MessagesLoader, typeof userLoader>> {
    constructor() {
        super([], true, true);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, ChatData | null>> {
        const chats = await serverCommunication.chatHandler.getChats(Array.from(key))
        return new Map<string, ChatData>(Object.entries(chats.chats));
    }

    protected async processData(rawData: ChatData): Promise<Chat<MessagesLoader, typeof userLoader>> {
        return new Chat(rawData, MessagesLoader, userLoader);
    }
}

export const chatLoader = new ChatLoader()