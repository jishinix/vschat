import { ExtensionState } from "./ExtensionState";
import { serverCommunication } from "./ServerWebsocketApi/ServerCommunication";
import fs from 'fs';
import path from 'path'
import * as vscode from "vscode"
import { exec } from 'child_process';


export class UpdateManager {
    static checkDownload() {

    }

    private static downloadUpdate() {

    }

    static async installUpdate() {
        const tempFolderUri = this.context.storageUri || this.context.globalStorageUri;
        console.log('UM in', tempFolderUri);
        if (!tempFolderUri) return;
        const tempFolderPath = tempFolderUri.fsPath;
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath, { recursive: true });
        }
        const vsixPath = path.join(tempFolderPath, 'update.vsix');

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "VSChat-Update wird installiert...",
            cancellable: false
        }, () => {
            return new Promise(async (resolve, reject) => {
                const buffer = await serverCommunication.updateHandler.getBinaryUpdateData();
                if (!buffer) reject();
                fs.writeFileSync(vsixPath, buffer);
                this.installLocal(vsixPath, resolve, reject)
            })
        })
    }

    private static async installLocal(vsixPath: string, resolve: Function, reject: Function) {
        let vscodeExe: string;

        if (process.platform === 'darwin') {
            // macOS spezifischer Pfad innerhalb der .app
            vscodeExe = path.join(vscode.env.appRoot, 'bin', 'code');
        } else {
            // Windows und Linux Standard-Pfad relativ zum appRoot
            vscodeExe = path.join(vscode.env.appRoot, '..', '..', 'bin', 'code');
        }

        const command = `"${vscodeExe}" --install-extension "${vsixPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Update fehlgeschlagen: ${error.message}`);
                reject(error);
                return;
            }

            vscode.window.showInformationMessage(
                'VSChat erfolgreich aktualisiert! Starte das Fenster neu, um das Update zu aktivieren.',
                'Jetzt neu starten'
            ).then(selection => {
                if (selection === 'Jetzt neu starten') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });

            resolve(true);
        });
    };


    static get context() {
        return ExtensionState.getContext();
    }
}