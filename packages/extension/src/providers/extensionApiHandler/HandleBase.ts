import * as vscode from 'vscode';
import { extensionAuthApi } from './Auth';

export class HandleBase {
    private idSave: Set<string> = new Set();

    constructor(webview: vscode.Webview) {
        webview.onDidReceiveMessage(async (data) => {
            console.log('got message in backend', data);
            if (data.command === 'confirmMessage') {
                this.idSave.delete(data.requestId);
                return
            }
            this.idSave.add(data.requestId);
            const send = async (sendPayload: Record<string, any>) => {
                console.log('postData', sendPayload)
                await webview.postMessage({
                    requestId: data.requestId,
                    payload: sendPayload
                });
                setTimeout(() => {
                    if (this.idSave.has(data.requestId)) {
                        send(sendPayload);
                    }
                }, 5 * 1000)
            }
            const nameSpaces = data.command.split('.');
            switch (nameSpaces[0]) {
                case 'auth':
                    extensionAuthApi(nameSpaces[1], send, data.data);
                    break;
            }
        });
    }
}