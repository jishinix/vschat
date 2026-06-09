import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { PrivateUser } from "../../models/PrivateUser";


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands> {
    handles = {
    } satisfies NamespaceHandler<typeof server_client_userCommands>['handles'];

    constructor() {
        super('user', server_client_userCommands)
    }

    async getLogedInUser() {
        const user = await this.request('getLogedInUser');
        if (!user?.user) return null;
        return new PrivateUser(user.user);
    }

    async getRelations() {
        return await this.request('getRelations');
    }

    async getUser(userId: string) {
        return await this.request('getUser', { userId: userId });
    }

    async getUsers(userIds: string[]) {
        return await this.request('getUsers', { userIds: userIds });
    }
}