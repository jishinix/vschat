import * as vscode from 'vscode';

let currentContext: vscode.ExtensionContext | null = null;

export const ExtensionState = {
    // Wird einmalig in der activate() aufgerufen
    setContext(context: vscode.ExtensionContext) {
        currentContext = context;
    },

    // Damit holst du dir den Context überall ab
    getContext(): vscode.ExtensionContext {
        if (!currentContext) {
            throw new Error('ExtensionState: Context wurde noch nicht initialisiert!');
        }
        return currentContext;
    },

    // Bequeme Shorthands, damit du nicht immer .getContext() tippen musst
    get extensionPath(): string {
        return this.getContext().extensionPath;
    },

    get globalState(): vscode.Memento {
        return this.getContext().globalState;
    }
};