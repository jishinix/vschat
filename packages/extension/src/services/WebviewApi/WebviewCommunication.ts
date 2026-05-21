import { BidirectionalMessageProtocolNamespaceWrapper, NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper'
import { AuthApi } from './AuthApi';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import * as vscode from 'vscode';
import { serverCommunication } from '../ServerWebsocketApi/ServerCommunication';


export class WebviewCommunication extends BidirectionalMessageProtocolNamespaceWrapper {
    public auth: AuthApi;

    constructor(private webview: vscode.Webview) {

        super('EXTENSION-WEBVIEW')
        this.auth = new AuthApi();;

        this.initReceive();
        this.initializeBaseHandlers([
            this.auth
        ], async () => {
            return serverCommunication.pingPongTest.ping();
        })
        console.log('mir gehts gut :)', this)
    }

    protected async send(payload: CommandPayload): Promise<void> {
        await this.webview.postMessage(payload);
    }
    protected initReceive(): void {
        this.webview.onDidReceiveMessage(async (data) => {
            this.receive(data);
        })
    }
}