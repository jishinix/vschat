
import { BidirectionalMessageProtocolNamespaceWrapper, NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper'
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import { AuthApi } from './AuthApi';
import { Injectable } from '@angular/core';
import { ChatApi } from './ChatApi';
import { UserApi } from './UserApi';
import { UserFeedbackEmits } from './UserFeedbackEmits';
import { UpdateApi } from './UpdateApi';

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
    public chat: ChatApi;
    public user: UserApi;
    public userFeedback: UserFeedbackEmits;
    public update: UpdateApi;

    constructor() {
        super('WEBVIEW')
        this.auth = new AuthApi();
        this.chat = new ChatApi();
        this.user = new UserApi();
        this.userFeedback = new UserFeedbackEmits();
        this.update = new UpdateApi();

        this.initReceive();
        this.initializeBaseHandlers([
            this.auth,
            this.chat,
            this.user,
            this.userFeedback,
            this.update
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