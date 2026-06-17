import { EventDispatcher } from '@vschat/shared/Utils/EventDispatcher';
import * as vscode from 'vscode';

let currentContext: vscode.ExtensionContext | null = null;

export const ExtensionState = {

    eventDispatcher: new EventDispatcher<'initContext'>(),
    setContext(context: vscode.ExtensionContext) {
        currentContext = context;
        this.eventDispatcher.dispatchEvent('initContext');
    },

    contextExists() {
        return !!currentContext;
    },

    getContext(): vscode.ExtensionContext {
        if (!currentContext) {
            throw new Error('ExtensionState: Context wurde noch nicht initialisiert!');
        }
        return currentContext;
    },

    getPackage() {
        return this.getContext().extension.packageJSON;
    },

    isDev() {
        return !!this.getPackage().config?.isDev;
    },

    // Bequeme Shorthands, damit du nicht immer .getContext() tippen musst
    get extensionPath(): string {
        return this.getContext().extensionPath;
    },

    get globalState(): vscode.Memento {
        return this.getContext().globalState;
    }
};