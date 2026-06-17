import { DecrypredMessageData } from "@vschat/shared/interfaces/Messages";
import * as vscode from "vscode";
import { WebviewCommunication } from "./WebviewApi/WebviewCommunication";
import { webViewNavigationStorage } from "./WebViewNavigationStorage";
import { Message } from "@vschat/shared/models/Message";
import { chatLoader } from "./Loader/ChatLoader";
import { userLoader } from "./Loader/UserLoader";
import { ExtensionState } from "./ExtensionState";

export class NotifivationManager {
    newMessage(message: Message<DecrypredMessageData, typeof chatLoader, typeof userLoader>) {

        if (webViewNavigationStorage.isInChat(message.data.chatId)) return;
        vscode.window.showInformationMessage(
            `[${message.data.sender.username}]: ${message.data.content}`,
            'Antworten'
        ).then(selection => {
            if (selection === 'Antworten') {
                vscode.commands.executeCommand(`workbench.view.extension.vschat-sidebar-container${ExtensionState.isDev() ? '-dev' : ''}`);
                setTimeout(() => {
                    WebviewCommunication.getInstance().userFeedback.updateView('chat', { chatId: message.data.chatId });
                }, 200)
            }
        });
    }
}