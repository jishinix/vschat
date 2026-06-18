import { BidirectionalMessageProtocolNamespaceWrapper, NamespaceHandler } from '@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper'
import { AuthApi } from './AuthApi';
import { CommandPayload } from '@vschat/shared/Utils/BidirectionalMessageProtocol';
import * as vscode from 'vscode';
import { serverCommunication } from '../ServerWebsocketApi/ServerCommunication';
import { ApiCoreController } from '../ServerWebsocketApi/ApiCoreController';
import { UserApi } from './UserApi';
import { UserFeedbackEmits } from './UserFeedbackEmits';
import { ChatApi } from './ChatApi';
import { UpdateApi } from './UpdateApi';
import { EventDispatcher } from '@vschat/shared/Utils/EventDispatcher';


export class WebviewCommunication extends BidirectionalMessageProtocolNamespaceWrapper {
    public auth: AuthApi;
    public core: ApiCoreController;
    public user: UserApi;
    public chat: ChatApi;
    public userFeedback: UserFeedbackEmits;
    public update: UpdateApi;
    private static instance: WebviewCommunication | null = null;

    public static eventDispatcher = new EventDispatcher<'initWebviewCommunication'>()

    private constructor(private webview: vscode.Webview) {

        super('EXTENSION-WEBVIEW')
        this.auth = new AuthApi();
        this.core = new ApiCoreController();
        this.user = new UserApi();
        this.chat = new ChatApi();
        this.userFeedback = new UserFeedbackEmits();
        this.update = new UpdateApi();

        this.initReceive();
        this.initializeBaseHandlers([
            this.auth,
            this.core,
            this.user,
            this.chat,
            this.userFeedback,
            this.update
        ])
        //serverCommunication.connect('asd');
    }

    static getInstance(webview?: vscode.Webview) {
        if (!this.instance) {
            if (!webview) return null;
            this.instance = new WebviewCommunication(webview);
            WebviewCommunication.eventDispatcher.dispatchEvent('initWebviewCommunication', [this.instance])
        }
        return this.instance;
    }

    protected async send(payload: CommandPayload): Promise<void> {
        try {
            await this.webview.postMessage(payload);
        } catch (e) {

        }
    }
    protected initReceive(): void {
        this.webview.onDidReceiveMessage(async (data) => {
            this.receive(data);
        })
    }
}