import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_authCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { PrivateUser } from "../../models/PrivateUser";
import { userLoader } from "../Loader/UserLoader";
import { WebviewCommunication } from "../WebviewApi/WebviewCommunication";


export class ApiAuthController extends NamespaceHandler<typeof server_client_authCommands> {
    private chatSession?: string;
    private interval?: ReturnType<typeof setInterval>;
    handles = {
    } satisfies NamespaceHandler<typeof server_client_authCommands>['handles'];

    constructor() {
        super('auth', server_client_authCommands)
    }

    async getChatSession() {
        if (this.chatSession) return this.chatSession;

        this.chatSession = (await this.request('getChatSession', {})).session;
        this.startInterval();
        return this.chatSession;
    }

    private startInterval() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(async () => {
            this.chatSession = (await this.request('getChatSession', {})).session;
        }, 1000 * 60 * 20);
    }

}