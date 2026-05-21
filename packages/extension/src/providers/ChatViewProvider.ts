import * as vscode from 'vscode';
import { WebviewCommunication } from '../services/WebviewApi/WebviewCommunication';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'vschat-sidebar';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        new WebviewCommunication(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'webview', 'browser', 'main.js')
        );
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'webview', 'browser', 'styles.css')
        );
        const polyfillsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'webview', 'browser', 'polyfills.js')
        );
        console.log(scriptUri);

        return `<!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
                
                <link href="${stylesUri}" rel="stylesheet">
                <title>VS Chat</title>
            </head>
            <body>
                <app-root></app-root>

                <script type="module" src="${polyfillsUri}"></script>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}