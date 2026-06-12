import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_chatCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { PrivateUser } from "../../models/PrivateUser";
import { userLoader } from "../Loader/UserLoader";
import { WebviewCommunication } from "../WebviewApi/WebviewCommunication";


export class ApiChatController extends NamespaceHandler<typeof server_client_chatCommands> {
    logedInUser: PrivateUser | null = null;
    handles = {

    } satisfies NamespaceHandler<typeof server_client_chatCommands>['handles'];

    constructor() {
        super('chat', server_client_chatCommands)
    }

    async getChats(chatIds: string[]) {
        return await this.request('getChats', { chatIds })
    }

    async getMessages(messageIds: string[]) {
        return await this.request('getMessages', { messageIds })
    }

    async fetchMessages(chatId: string, max: number = 50, lastMessageId: string | null = null) {
        return await this.request('fetchMessages', { chatId, max, lastMessageId })
    }

    async fetchMessageIds(chatId: string, max: number = 50, lastMessageId: string | null = null) {
        return await this.request('fetchMessageIds', { chatId, max, lastMessageId })
    }

}