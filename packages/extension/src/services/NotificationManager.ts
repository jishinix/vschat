import { DecrypredMessageData } from "@vschat/shared/interfaces/Messages";
import * as vscode from "vscode";

export class NotifivationManager {
    newMessage(message: DecrypredMessageData) {

        vscode.window.showInformationMessage(
            `[${message.sender.username}]: ${message.content}`,
            'Antworten'
        ).then(selection => {
            if (selection === 'Antworten') {
                vscode.commands.executeCommand('workbench.view.extension.vschat-sidebar-container');
            }
        });
    }
}