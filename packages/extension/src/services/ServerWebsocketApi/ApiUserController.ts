import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { PrivateUser } from "../../models/PrivateUser";


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands> {
    logedInUser: PrivateUser | null = null;
    handles = {
    } satisfies NamespaceHandler<typeof server_client_userCommands>['handles'];

    constructor() {
        super('user', server_client_userCommands)
    }

    async getLogedInUser() {
        if (this.logedInUser) return this.logedInUser;

        const user = await this.request('getLogedInUser');
        if (!user?.user) return null;
        this.logedInUser = new PrivateUser(user.user);
        return this.logedInUser
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

    async sendFriendRequest(userId: string) {
        return await this.request('sendFriendRequest', { userId });
    }
}