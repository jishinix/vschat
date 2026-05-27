import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands> {
    handles = {
    } satisfies NamespaceHandler<typeof server_client_userCommands>['handles'];

    async getLogedInUser() {
        return await this.request('getLogedInUser');
    }

    async getRelations() {
        return await this.request('getRelations');
    }

    async getUser(userId: string) {
        return await this.request('getUser', { userId: userId });
    }
}