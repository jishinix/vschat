import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Chat } from '@vschat/shared/models/Chat';
import { Cache } from "@vschat/shared/Utils/Cache";
import { database } from "../DbService";
import { userLoader } from "./UserLoader";
import { LoaderMessageType, MessagesLoader } from "./MessagesLoader";
import { UserReference } from "@vschat/shared/interfaces/User";
import { ServerChat } from "../../models/Chat";


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
}

export const chatLoader = new ChatLoader()