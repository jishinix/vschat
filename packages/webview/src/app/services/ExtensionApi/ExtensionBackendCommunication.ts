
import { BidirectionalMessageProtocolNamespaceWrapper, NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper'
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { AuthApi } from './AuthApi';
import { Injectable } from '@angular/core';
import { ChatApi } from './ChatApi';
import { UserApi } from './UserApi';

interface VsCodeApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;

const vscode = acquireVsCodeApi();


@Injectable({
    providedIn: 'root'
})
export class ExtensionBackendCommunication extends BidirectionalMessageProtocolNamespaceWrapper {
    private vscode = vscode;
    public auth: AuthApi;
    public chat: ChatApi
    public user: UserApi

    constructor() {
        super('WEBVIEW')
        this.auth = new AuthApi();
        this.chat = new ChatApi();
        this.user = new UserApi();

        this.initReceive();
        this.initializeBaseHandlers([
            this.auth,
            this.chat,
            this.user
        ]);
    }

    protected async send(payload: CommandPayload): Promise<void> {
        this.vscode.postMessage(payload);
    }
    protected initReceive(): void {
        window.addEventListener('message', event => {
            this.receive(event.data);
        })
    }
}