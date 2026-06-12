import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { BidirectionalMessageProtocolNamespaceWrapper } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper';
import { io, Socket } from 'socket.io-client';
import { ApiCoreController } from './ApiCoreController';
import { ApiUserController } from './ApiUserController';
import { ApiChatController } from './ApiChatController';


class ServerCommunication extends BidirectionalMessageProtocolNamespaceWrapper {
    private _socket!: Socket;
    private isInitialized = false;
    coreHandler: ApiCoreController;
    userHandler: ApiUserController;
    chatHandler: ApiChatController;

    constructor() {
        super('EXTENSION-SERVER')

        this.coreHandler = new ApiCoreController();
        this.userHandler = new ApiUserController();
        this.chatHandler = new ApiChatController();
        //this.initReceive();

        this.initializeBaseHandlers([
            this.coreHandler,
            this.userHandler,
            this.chatHandler
        ])
    }
    protected async send(payload: CommandPayload): Promise<void> {
        this.socket.send(payload)
    }
    protected initReceive(): void {
        if (this.isInitialized) return;

        this.socket.on('message', (payload: CommandPayload) => {
            this.receive(payload);
        });

        this.socket.on("connect", () => {
            console.log('[websocket][extensionbackend] connected successfully');
        });

        this.socket.on("disconnect", (reason) => {
            console.warn('[websocket][extensionbackend] disconnected:', reason);
        });

        this.isInitialized = true;
    }

    private get socket() {
        if (!this._socket) throw new Error('connect before use socket')
        return this._socket
    }

    connect(sessionToken: string) {
        if (this._socket) {
            this._socket.disconnect();
        }

        const url = `http://localhost:7011`;

        this._socket = io(url, {
            autoConnect: true,
            reconnection: true,
            auth: {
                token: sessionToken
            }
        });

        this.initReceive();
    }
}

export const serverCommunication = new ServerCommunication();