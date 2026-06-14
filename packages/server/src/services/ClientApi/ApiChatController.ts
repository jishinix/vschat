import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_chatCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { User } from "../../models/User";
import { Socket } from "socket.io";
import { socketWithDataType } from "../WebsocketManager";
import { userLoader } from "../Loader/UserLoader";
import { Relationship } from "../../models/Relationship";
import { Return } from "@vschat/shared/models/Return";
import { UserActionReturnCodes, UserSendFriendRequestReturn } from "@vschat/shared/interfaces/UserActionInterfaces";
import { PublicUser, RelationshipStatus, UserReference } from "@vschat/shared/interfaces/User";
import { MessagesLoader } from "../Loader/MessagesLoader";
import { chatLoader } from "../Loader/ChatLoader";
import { MessageData } from "@vschat/shared/interfaces/Messages";
import { ChatActions } from "../ChatActions";
import { ChatActionReturnCodes } from "@vschat/shared/interfaces/ChatActionInterfaces";
import { ChatData } from "@vschat/shared/interfaces/Chat";


export class ApiChatController extends NamespaceHandler<typeof server_client_chatCommands, { socket: socketWithDataType }> {
    handles = {
        'fetchMessageIds': async (data) => {
            return { messageIds: await MessagesLoader.getMessageIds(data.chatId, data.max, data.lastMessageId) };
        },
        'getMessages': async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            const chat = (await chatLoader.getData([data.chatId])).get(data.chatId);
            if (!chat || !user || !chat.data.participants.some(p => p.id === user.data.id)) {
                return { messages: {} as Record<string, MessageData> };
            }
            const messageMap = Array.from(await chat.getMessages(data.messageIds)).map(([key, val]) => {
                return [key, val.data]
            });
            return { messages: Object.fromEntries(messageMap) }
        },
        'getChats': async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            if (!user) return { chats: {} };

            const arr = Array.from((await chatLoader.getData(data.chatIds)).entries())
                .filter(e => e[1]?.checkUserIsAuthorized(user.data.id))
                .map(([key, val]) => {
                    return [key, val?.data]
                }).filter(e => e)
            return { chats: Object.fromEntries(arr) as Record<string, ChatData<UserReference>> };
        },
        'createChat': async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            if (!user) return { chat: new Return(ChatActionReturnCodes.noPermissions, undefined) }
            const ca = new ChatActions();
            const chat = await ca.createChat(user, data.chatCreateData);
            return { chat }
        },
        'sendMessage': async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            const chat = (await chatLoader.getData([data.message.chatId])).get(data.message.chatId);
            if (!user || !chat) return {};

            chat.addMessage(data.message, user.data);

        }
    } satisfies NamespaceHandler<typeof server_client_chatCommands, { socket: socketWithDataType }>['handles'];

    static async sendNewRelationship(relation: Relationship) {
        const usersMap = await userLoader.getData([relation.data.userId, relation.data.relatedUserId]);
        const users = [usersMap.get(relation.data.userId), usersMap.get(relation.data.relatedUserId)].filter(e => !!e);
        if (users.length != 2) return false;
        relation = { data: JSON.parse(JSON.stringify(relation.data)) } as any;
        if (relation.data.status === RelationshipStatus.friendshipRequestIgnored) {
            relation.data.status = RelationshipStatus.none
        }
        for (const [index, user] of users.entries()) {
            user.send((protocol) => {
                protocol.userHandler.emit('relationUpdate', { relation: relation.data })
            })
        }
        return true;
    }

    constructor() {
        super('chat', server_client_chatCommands)
    }

    async getCurrentLogedInUser(): Promise<User> {
        return {} as User;
    }

    async sendMsg(message: MessageData) {
        this.request('reciveMessage', { message: message })
    }
}