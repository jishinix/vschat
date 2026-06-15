import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_authCommands, server_client_updateCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { UpdateManager } from "../UpdateManager";

export class ApiUpdateController extends NamespaceHandler<typeof server_client_updateCommands> {
    handles = {
    } satisfies NamespaceHandler<typeof server_client_updateCommands>['handles'];

    constructor() {
        super('update', server_client_updateCommands);

    }

    async getVersion() {
        return await this.request('getVersion');
    }

    async getBinaryUpdateData() {
        return await this.request('downloadVersion');
    }

}