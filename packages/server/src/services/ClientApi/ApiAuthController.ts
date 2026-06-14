

import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_authCommands, server_client_chatCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
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
import { CryptoService } from "@vschat/shared/Utils/CryptoService";


export class ApiAuthController extends NamespaceHandler<typeof server_client_authCommands, { socket: socketWithDataType }> {
    handles = {
        'getChatSession': async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            if (!user) return { session: CryptoService.generateSecureAESKey() };
            return { session: await user.getSessionKey() }
        }
    } satisfies NamespaceHandler<typeof server_client_authCommands, { socket: socketWithDataType }>['handles'];

    constructor() {
        super('auth', server_client_authCommands)
    }
}