import { Attachment, MessageData } from "@vschat/shared/interfaces/Messages";
import { Cache } from "@vschat/shared/Utils/Cache";
import { database } from "../DbService";
import { timeStamp } from "node:console";
import { userLoader } from "./UserLoader";
import { PrivateUser } from "@vschat/shared/interfaces/User";
import { User } from "../../models/User";
import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Message } from '@vschat/shared/models/Message'
import { chatLoader } from "./ChatLoader";


export type LoaderMessageType = Message<MessageData, typeof chatLoader, typeof userLoader>

export class MessagesLoader extends Cache<MessageData, LoaderMessageType> {
    constructor(private chatId: string) {
        super([], true);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, MessageData>> {
        const rtn = new Map<string, MessageData>();
        const messages = await database('Messages')
            .select([
                'Messages.Id as MessageId',
                'ChatId',
                'Timestamp',
                'EncryptedContent.Content as EncryptedContentValue',
                'EncryptedContent.Fingerprint as Fingerprint',
                'Users.Id as UserId',
                'Username',
                'PublicKey'
            ])
            .join('Users', 'SenderId', '=', 'Users.Id')
            .join('EncryptedContent', 'EncryptedContentId', '=', 'EncryptedContent.Id')
            .whereIn('Messages.Id', Array.from(key))

        for (const message of messages) {
            rtn.set(message.MessageId, {
                id: message.MessageId,
                chatId: message.ChatId,
                timestamp: message.Timestamp,
                encryptedContent: {
                    encryptedContent: message.EncryptedContentValue,
                    fingerPrint: message.Fingerprint,
                    keys: {}
                },
                sender: {
                    id: message.UserId,
                    username: message.Username,
                    publicKey: message.PublicKey
                },
                attachments: attachments.map(e=>({

                }))
            })
        }
        
        
        const attachmentRtn = await database('MessageAttachments')
            .select([
                'Id',
                'EncryptedContentId',
                'MineType',
                'FileName',
                'MessageId'
            ])
            .join('EncryptedContent', 'EncryptedContentId', '=', 'EncryptedContent.Id')
            .where('MessageId', 'in', messages.map(e=>e.MessageId))
            
        const attachments = new Map<string, Attachment>();
        for(const attachment of attachmentRtn){
            attachments.set(attachment.Id, {
                id: attachment.Id,
                fileName: attachment.FileName,
                mineType: attachment.mineType
            })
        }

        const encryptionKeys = await database('EncryptedContentKeys')
            .select([
                'Messages.Id as MessageId',
                'UserId',
                'Key'
            ])
            .join('EncryptedContent', 'EncryptedContentKeys.EncryptedContentId', '=', 'EncryptedContent.Id')
            .join('Messages', 'Messages.EncryptedContentId', '=', 'EncryptedContent.Id')
            .whereIn('Messages.Id', Array.from(key))

        for (const key of encryptionKeys) {
            const msg = rtn.get(key.MessageId);
            if (msg)
                msg.encryptedContent.keys[key.UserId] = key.Key
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
        await database.transaction(async (trx) => {

            const entries = {
                entcryptedContent: [] as { Content: string, Fingerprint: string }[],
                entcryptedContentId: [] as number[],
                entcryptedKey: [] as {
                    UserId: string,
                    Key: string
                }[][],
                message: [] as {
                    Id: string,
                    Timestamp: number,
                    SenderId: string,
                    ChatId: string
                }[],
            }

            data.forEach((val, key) => {
                entries.entcryptedContent.push({ Content: val.encryptedContent.encryptedContent, Fingerprint: val.encryptedContent.fingerPrint });
                entries.entcryptedKey.push(
                    Array.from(Object.entries(val.encryptedContent.keys)).map(([key, val]) => ({ UserId: key, Key: val }))
                )
                entries.message.push({
                    Id: val.id,
                    Timestamp: val.timestamp,
                    SenderId: val.sender.id,
                    ChatId: val.chatId
                })
            })
            entries.entcryptedContentId = await trx('EncryptedContent')
                .insert(entries.entcryptedContent)
                .returning('Id')

            const insertedEntcryptedKey = entries.entcryptedKey.map((e, i) => e.map(e2 => ({
                ...e2,
                EncryptedContentId: entries.entcryptedContentId[i]
            }))).flat()

            await trx('EncryptedContentKeys')
                .insert(insertedEntcryptedKey)
            await trx('Messages')
                .insert(entries.message.map((e, i) => ({
                    ...e,
                    EncryptedContentId: entries.entcryptedContentId[i]
                })))
        })
    }
}