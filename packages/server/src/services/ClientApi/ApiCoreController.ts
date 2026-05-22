import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_coreCommands } from '@vschat/shared/constants/protocolCommands'


export class ApiCoreController extends NamespaceHandler<typeof server_client_coreCommands> {
    constructor() {
        super('core', server_client_coreCommands)
    }
    handles = {
        userNotFound() { }
    };

    async userNotFound() {
        await this.emit(server_client_coreCommands.USER_NOT_FOUND.name);
    }
}