
interface VsCodeApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;

export abstract class ExtensionAPIBase {
    private vscode = acquireVsCodeApi();
    private callbacks: Map<string, (res: any) => void> = new Map();
    private namespace: string;
    constructor(namespace: string) {
        this.namespace = namespace;
        this.init();
    }

    private async send(message: any) {
        this.vscode.postMessage(message);
    }

    protected async request<T>(command: string, data?: Record<string, any>): Promise<T> {
        const requestId = Math.random().toString(36).substring(7);
        this.send({ command: `${this.namespace}.${command}`, data, requestId });

        return new Promise(resolve => {
            this.callbacks.set(requestId, resolve);
        });
    }

    protected init() {
        window.addEventListener('message', event => {
            const { requestId, payload } = event.data;
            if (this.callbacks.has(requestId)) {
                this.callbacks.get(requestId)!(payload);
                this.send({ command: 'confirmMessage', requestId });
                this.callbacks.delete(requestId);
            }
        });
    }
}