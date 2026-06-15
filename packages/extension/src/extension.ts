import * as dotenv from 'dotenv';
import * as vscode from 'vscode';
import { ChatViewProvider } from './providers/ChatViewProvider';
import { ExtensionState } from './services/ExtensionState';
dotenv.config();



export function activate(context: vscode.ExtensionContext) {
	ExtensionState.setContext(context);

	const provider = new ChatViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider)
	);
}