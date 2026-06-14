import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_chatCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { PrivateUser } from "../../models/PrivateUser";
import { userLoader } from "../Loader/UserLoader";
import { WebviewCommunication } from "../WebviewApi/WebviewCommunication";
import { ChatCreateData } from '@vschat/shared/interfaces/Chat'
import { MessageCreateData } from "@vschat/shared/interfaces/Messages";
import { MessagesLoader } from "../Loader/MessagesLoader";
import { chatLoader } from "../Loader/ChatLoader";


export class ApiChatController extends NamespaceHandler<typeof server_client_chatCommands> {
    logedInUser: PrivateUser | null = null;
    handles = {
        'reciveMessage': async (data) => {
            const chat = (await chatLoader.getData([data.message.chatId])).get(data.message.chatId);
            if (chat) {
                const success = chat.messageLoader.cacheMessage(data.message);
                const msg = (await chat.messageLoader.getData([data.message.id])).get(data.message.id)
                if (success && msg) {
                    WebviewCommunication.getInstance().chat.reciveMessage(msg.data)
                }
            }
        }
    } satisfies NamespaceHandler<typeof server_client_chatCommands>['handles'];

    constructor() {
        super('chat', server_client_chatCommands)
    }

    async getChats(chatIds: string[]) {
        return await this.request('getChats', { chatIds })
    }

    async getMessages(chatId: string, messageIds: string[]) {
        return await this.request('getMessages', { chatId, messageIds })
    }

    async fetchMessageIds(chatId: string, max: number = 50, lastMessageId: string | null = null) {
        return await this.request('fetchMessageIds', { chatId, max, lastMessageId })
    }

    async createChat(payload: ChatCreateData<string>) {
        return await this.request('createChat', { chatCreateData: payload })
    }

    async sendMsg(message: MessageCreateData) {
        return await this.request('sendMessage', { message: message });
    }

}