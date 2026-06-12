import { MessageData } from "@vschat/shared/interfaces/Messages";
import { Cache } from "@vschat/shared/Utils/Cache";
import { timeStamp } from "node:console";
import { userLoader } from "./UserLoader";
import { PrivateUser } from "@vschat/shared/interfaces/User";
import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Message } from '@vschat/shared/models/Message'
import { chatLoader } from "./ChatLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";


type MessageType = Message<typeof chatLoader, typeof userLoader>

export class MessagesLoader extends Cache<MessageData, MessageType> {
    constructor(private chatId: string) {
        super([]);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, MessageData>> {
        const messages = await serverCommunication.chatHandler.getMessages(Array.from(key))
        return new Map<string, MessageData>(Object.entries(messages.messages));
    }

    protected async getProcessedData(rawData: MessageData): Promise<MessageType> {
        return new Message(rawData, {} as any, userLoader);
    }

    async fetch(max: 50, lastMessageId: string | null = null) {
        const messageIds = await serverCommunication.chatHandler.fetchMessageIds(this.chatId, max, lastMessageId);

        const messages = await this.getData(messageIds.messageIds)
        return Array.from(await messages.values())
            .filter(e => !!e)
            .sort((a: MessageType, b: MessageType) => {
                return a!.data.timestamp - b!.data.timestamp
            })
    }
}