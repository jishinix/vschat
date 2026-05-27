import { Socket } from 'socket.io';
import { BidirectionalMessageProtocolNamespaceWrapper } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { ApiCoreController } from './ApiCoreController';

export class ClientCommunication extends BidirectionalMessageProtocolNamespaceWrapper<{ socket: Socket }> {
    coreHandler: ApiCoreController;

    constructor(private socket: Socket) {
        super('SERVER');

        this.coreHandler = new ApiCoreController()
        this.initReceive();

        this.initializeBaseHandlers([
            this.coreHandler
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