import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { User } from "../../models/User";
import { Socket } from "socket.io";
import { socketWithDataType } from "../WebsocketManager";
import { userLoader } from "../UserLoader";


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands, { socket: socketWithDataType }> {
    handles = {
        getRelations: async (data, extraData) => {
            const user = await extraData.socket.data.getUser()
            return { relations: (await user?.privateData.relations) || [] }
        },
        getLogedInUser: async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            return { user: user?.privateData || null };
        },
        getUser: async (data, extraData) => {
            const user = (await userLoader.getData([data.userId])).get(data.userId);
            return { user: user?.privateData || null };
        }
    } satisfies NamespaceHandler<typeof server_client_userCommands, { socket: socketWithDataType }>['handles'];

    constructor() {
        super('user', server_client_userCommands)
    }

    async getCurrentLogedInUser(): Promise<User> {
        return {} as User;
    }
}