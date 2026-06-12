import * as vscode from 'vscode';
import { WebviewCommunication } from '../services/WebviewApi/WebviewCommunication';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'vschat-sidebar';
    private _view?: vscode.WebviewView;
    private _themeListener?: vscode.Disposable;

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

        // Erstmaliges Rendern des HTMLs
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        WebviewCommunication.getInstance(webviewView.webview);

        // WICHTIG: Wenn der Nutzer das Theme wechselt (z.B. von Dark zu Light),
        // müssen wir das HTML neu setzen, damit die Inline-CSS-Variablen aktualisiert werden.
        this._themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        });

        // Listener aufräumen, wenn die View geschlossen/zerstört wird
        webviewView.onDidDispose(() => {
            if (this._themeListener) {
                this._themeListener.dispose();
            }
        });
    }

    /**
     * Hilfsmethode, um VS Code Farbdefinitionen sicher auszulesen.
     * Nutzt die ThemeColor-API, um die exakten Hex-Werte der Token zu erhalten.
     */
    private _getSyntaxCustomColors(): string {
        // Diese VS Code IDs matchen im jeweiligen Theme meistens exakt das Syntax-Highlighting
        const tokenMapping = {
            '--syntax-class': 'symbolIcon.classForeground',
            '--syntax-function': 'symbolIcon.functionForeground',
            '--syntax-keyword': 'symbolIcon.keywordForeground',
            '--syntax-variable': 'symbolIcon.variableForeground',
            '--syntax-string': 'symbolIcon.stringForeground',
            '--syntax-number': 'symbolIcon.numberForeground',
            '--syntax-comment': 'symbolIcon.textForeground'
        };

        // Wir bauen einen String aus CSS-Variablen (z.B. "--syntax-class: #4ec9b0;")
        let cssVariables = '';

        for (const [cssVar, vscodeColorId] of Object.entries(tokenMapping)) {
            // vscode.ThemeColor gibt uns Zugriff auf das aktuelle Theme
            const color = new vscode.ThemeColor(vscodeColorId);
            // Da wir im String-Literal sind, wandelt VS Code das intern für die Workbench um.
            // Alternativ nutzen wir hier die CSS-Zuweisung über die nativen VS Code Variablen,
            // die VS Code für System-Icons in der Webview anbietet:
            const systemVarName = vscodeColorId.replace(/\./g, '-');
            cssVariables += `${cssVar}: var(--vscode-${systemVarName}); `;
        }

        return cssVariables;
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

        // Dynamische Syntax-Farben generieren
        const syntaxStyles = this._getSyntaxCustomColors();

        return `<!DOCTYPE html>
            <html lang="de" style="${syntaxStyles}">
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