import { Socket } from 'socket.io';
import { BidirectionalMessageProtocolNamespaceWrapper } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { ApiCoreController } from './ApiCoreController';
import { ApiUserController } from './ApiUserController';



export class ClientCommunication extends BidirectionalMessageProtocolNamespaceWrapper<{ socket: Socket }> {
    coreHandler: ApiCoreController;
    userHandler: ApiUserController;

    constructor(private socket: Socket) {
        super('SERVER');

        this.coreHandler = new ApiCoreController()
        this.userHandler = new ApiUserController();
        this.initReceive();

        this.initializeBaseHandlers([
            this.coreHandler,
            this.userHandler
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