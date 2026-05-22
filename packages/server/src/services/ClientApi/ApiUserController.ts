import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands> {
    handles = {

    } satisfies NamespaceHandler<typeof server_client_userCommands>['handles'];
}