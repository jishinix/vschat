import { BidirectionalMessageProtocolNamespaceWrapper, NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper'
import { AuthApi } from './AuthApi';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import * as vscode from 'vscode';
import { serverCommunication } from '../ServerWebsocketApi/ServerCommunication';
import { ApiCoreController } from '../ServerWebsocketApi/ApiCoreController';
import { UserApi } from './UserApi';
import { UserFeedbackEmits } from './UserFeedbackEmits';
import { ChatApi } from './ChatApi';


export class WebviewCommunication extends BidirectionalMessageProtocolNamespaceWrapper {
    public auth: AuthApi;
    public core: ApiCoreController;
    public user: UserApi;
    public chat: ChatApi;
    public userFeedback: UserFeedbackEmits;
    private static instance: WebviewCommunication | null = null;

    private constructor(private webview: vscode.Webview) {

        super('EXTENSION-WEBVIEW')
        this.auth = new AuthApi();
        this.core = new ApiCoreController();
        this.user = new UserApi();
        this.chat = new ChatApi();
        this.userFeedback = new UserFeedbackEmits();

        this.initReceive();
        this.initializeBaseHandlers([
            this.auth,
            this.core,
            this.user,
            this.chat,
            this.userFeedback,
        ])
        //serverCommunication.connect('asd');
    }

    static getInstance(webview?: vscode.Webview) {
        if (!this.instance) {
            if (!webview) throw new Error('in construct WebviewCommunication you need a webview');
            this.instance = new WebviewCommunication(webview);
        }
        return this.instance;
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