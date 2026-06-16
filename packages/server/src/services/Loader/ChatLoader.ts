import { ChatData, ChatList, RawChatListInfos } from "@vschat/shared/interfaces/Chat";
import { Chat } from '@vschat/shared/models/Chat';
import { Cache } from "@vschat/shared/Utils/Cache";
import { database } from "../DbService";
import { userLoader } from "./UserLoader";
import { LoaderMessageType, MessagesLoader } from "./MessagesLoader";
import { UserReference } from "@vschat/shared/interfaces/User";
import { ServerChat } from "../../models/Chat";
import { Utils } from "@vschat/shared/Utils/GenerlUtils";


class ChatLoader extends Cache<ChatData<UserReference>, ServerChat> {
    constructor() {
        super([], false, true);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, ChatData<UserReference> | null>> {
        const aKeys = Array.from(key);
        const rtn = new Map<string, ChatData<UserReference>>();
        const chats = await database('Chats')
            .select(['Id', 'Name', 'Type'])
            .whereIn('Id', aKeys);

        const participants = await database('ChatParticipants')
            .select(['ChatId', 'UserId', 'Username', 'PublicKey'])
            .join('Users', 'UserId', '=', 'Id')
            .whereIn('ChatId', aKeys)

        for (const chat of chats) {
            rtn.set(chat.Id, {
                id: chat.Id,
                name: chat.Name,
                type: chat.Type,
                participants: []
            })
        }
        for (const participant of participants) {
            const val = rtn.get(participant.ChatId);
            if (val) val.participants.push({
                id: participant.UserId,
                username: participant.Username,
                publicKey: participant.PublicKey
            })
        }

        return rtn;
    }

    protected async processData(rawData: ChatData<UserReference>): Promise<ServerChat> {
        return new ServerChat(rawData, MessagesLoader, userLoader);
    }

    protected async saveData(data: Map<string, ChatData<UserReference>>): Promise<void> {
        const chatsArray = Array.from(data.values());
        const participantsEntries: Record<string, any>[] = [];
        const chatsEntries = chatsArray.map(e => {
            e.participants.forEach(p => {
                participantsEntries.push({
                    ChatId: e.id,
                    UserId: p.id
                })
            })
            return {
                Id: e.id,
                Type: e.type,
                Name: e.name,
            }
        });
        await database.transaction(async (trx) => {
            await trx('Chats').insert(chatsEntries).onConflict('Id').merge()
            await trx('ChatParticipants').delete().whereIn('ChatId', Array.from(data.keys()))
            await trx('ChatParticipants').insert(participantsEntries).onConflict(['ChatId', 'UserId']).ignore()
        })
    }

    async getRawChatList(userId: string): Promise<Record<string, RawChatListInfos>> {
        const response = await database.transaction(trx => {
            const response = trx('ChatParticipants')
                .select([
                    'ChatParticipants.ChatId as ChatId',
                    'LastReadedUserChatMap.MessageId as LastReadedMessage',
                    trx.raw('COUNT(DISTINCT CASE WHEN ?? > COALESCE(??, 0) THEN ?? END) as unreadedMessages', [
                        'AllMessages.Timestamp',
                        'LastReadMessage.Timestamp',
                        'AllMessages.Id'
                    ]),
                    trx.raw('MAX(??) as latestMessageTimestamp', ['AllMessages.Timestamp']),
                ])
                .leftJoin('Messages as AllMessages', 'AllMessages.ChatId', '=', 'ChatParticipants.ChatId')

                .leftJoin('LastReadedUserChatMap', function () {
                    this.on('LastReadedUserChatMap.ChatId', '=', 'ChatParticipants.ChatId')
                        .andOn('LastReadedUserChatMap.UserId', '=', trx.raw('?', [userId]));
                })

                .leftJoin('Messages as LastReadMessage', 'LastReadMessage.Id', '=', 'LastReadedUserChatMap.MessageId')

                .where('ChatParticipants.UserId', userId)
                .groupBy(['ChatParticipants.ChatId', 'LastReadedMessage']);
            return response;
        })
        const rtn: Record<string, {
            unreadedMessages: number;
            lastMsgTimestamp: number;
            lastReadedMessageId: string
        }> = {};

        (response as { 'ChatId': string, unreadedMessages: number, latestMessageTimestamp: number, LastReadedMessage: string }[]).forEach((e: { 'ChatId': string, unreadedMessages: number, latestMessageTimestamp: number, LastReadedMessage: string }) => {
            rtn[e.ChatId] = {
                unreadedMessages: e.unreadedMessages,
                lastMsgTimestamp: e.latestMessageTimestamp,
                lastReadedMessageId: e.LastReadedMessage
            }
        })
        return rtn;
    }
    async getLastReadedMessageId(userId: string, chatId: string): Promise<string> {
        const messageId = await database('LastReadedUserChatMap')
            .select('MessageId')
            .first()
            .where('UserId', '=', userId)
            .where('ChatId', '=', chatId)

        return messageId.MessageId;
    }
    async markChatAsReadPersistent(userId: string, chatId: string): Promise<string> {
        return await database.transaction(
            async trx => {
                const messageId = (await trx('Messages').select('Id').first().where('ChatId', chatId).orderBy('Timestamp', 'desc'))?.Id
                await trx('LastReadedUserChatMap')
                    .insert({
                        MessageId: messageId,
                        UserId: userId,
                        ChatId: chatId
                    }).onConflict(['UserId', 'ChatId']).merge()
                return messageId;
            }
        )
    }
}

export const chatLoader = new ChatLoader()