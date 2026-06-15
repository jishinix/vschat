import { Socket } from 'socket.io';
import { BidirectionalMessageProtocolNamespaceWrapper } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { ApiCoreController } from './ApiCoreController';
import { ApiUserController } from './ApiUserController';
import { ApiChatController } from './ApiChatController';
import { ApiAuthController } from './ApiAuthController';
import { ApiUpdateController } from './ApiUpdateController';



export class ClientCommunication extends BidirectionalMessageProtocolNamespaceWrapper<{ socket: Socket }> {
    coreHandler: ApiCoreController;
    userHandler: ApiUserController;
    chatHandler: ApiChatController;
    authHandler: ApiAuthController;
    updateHandler: ApiUpdateController;

    constructor(private socket: Socket) {
        super('SERVER');

        this.coreHandler = new ApiCoreController();
        this.userHandler = new ApiUserController();
        this.chatHandler = new ApiChatController();
        this.authHandler = new ApiAuthController();
        this.updateHandler = new ApiUpdateController();
        this.initReceive();

        this.initializeBaseHandlers([
            this.coreHandler,
            this.userHandler,
            this.chatHandler,
            this.authHandler,
            this.updateHandler
        ])
    }

    initializeUserAuthHandler() {

    }

    protected async send(payload: CommandPayload): Promise<void> {
        this.socket.emit('message', payload);
    }

    protected initReceive(): void {
        this.socket.on('message', (data: CommandPayload) => {
            this.receive(data, { socket: this.socket });
        });
    }
}