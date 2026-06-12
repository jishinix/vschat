import { MessageData } from "@vschat/shared/interfaces/Messages";
import { Cache } from "@vschat/shared/Utils/Cache";
import { database } from "../DbService";
import { timeStamp } from "node:console";
import { userLoader } from "./UserLoader";
import { PrivateUser } from "@vschat/shared/interfaces/User";
import { User } from "../../models/User";
import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Message } from '@vschat/shared/models/Message'
import { chatLoader } from "./ChatLoader";


export type LoaderMessageType = Message<typeof chatLoader, typeof userLoader>

export class MessagesLoader extends Cache<MessageData, LoaderMessageType> {
    constructor(private chatId: string) {
        super([]);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, MessageData>> {
        const rtn = new Map<string, MessageData>();
        const messages = await this.getDefaultMessageQuery()
            .whereIn('Messages.Id', Array.from(key))
        for (const message of messages) {
            rtn.set(message.MessageId, this.generateMessageFromDbRtn(message))
        }
        return rtn;
    }

    protected async getProcessedData(rawData: MessageData): Promise<LoaderMessageType> {
        return new Message(rawData, {} as any, userLoader);
    }

    async fetch(max: number = 50, lastMessageId: string | null = null) {
        const messages = await this.getData(await MessagesLoader.getMessageIds(this.chatId, max, lastMessageId));
        return Array.from(await messages.values())
            .filter(e => !!e)
            .sort((a, b) => {
                return a!.data.timestamp - b!.data.timestamp
            })
    }

    static async getMessageIds(chatId: string, max: number = 50, lastMessageId: string | null = null) {
        const messagesQuery = database('Messages').select('Id')
            .where('ChatId', chatId)
            .orderBy('Timestamp', 'desc')
            .limit(max)
        if (lastMessageId) {
            const subquery = database('Messages')
                .select('Timestamp')
                .where('Id', lastMessageId)
                .first();
            messagesQuery
                .where('Timestamp', '<', subquery)
        }

        return (await messagesQuery).map(e => e.Id)
    }

    protected async saveData(data: Map<string, MessageData>): Promise<void> {
        const messageArray = Array.from(data.values());
        const messageEntries = messageArray.map(e => {
            return {
                Id: e.id,
                ChatId: e.chatId,
                Timestamp: e.timestamp,
                EncryptedContent: e.encryptedContent,
                SenderId: e.sender.id
            }
        });
        await database('Messages').insert(messageEntries).onConflict(['Id']).merge();
    }

    private generateMessageFromDbRtn(message: any): MessageData {
        return {
            id: message.MessageId,
            chatId: message.ChatId,
            timestamp: message.Timestamp,
            encryptedContent: message.EncryptedContent,
            sender: {
                id: message.UserId,
                username: message.Username,
                publicKey: message.PublicKey
            }
        }
    }

    private getDefaultMessageQuery(select: string[] | null = null) {
        return database('Messages')
            .select(select || [
                'Messages.Id as MessageId',
                'ChatId',
                'Timestamp',
                'EncryptedContent',
                'Users.Id as UserId',
                'Username',
                'PublicKey'
            ])
            .join('Users', 'SenderId', '=', 'Users.Id')
    }
}