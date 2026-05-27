import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_coreCommands } from '@vschat/shared/constants/protocolCommands'


export class ApiCoreController extends NamespaceHandler<typeof server_client_coreCommands> {
    constructor() {
        super('core', server_client_coreCommands)
    }
    handles = {
        userNotFound: async (data) => {
            return;
        }
    } satisfies NamespaceHandler<typeof server_client_coreCommands>['handles'];

    async userNotFound() {
        await this.emit('userNotFound');
    }
}