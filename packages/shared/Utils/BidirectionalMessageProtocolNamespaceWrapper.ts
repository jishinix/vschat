import { BidirectionalMessageProtocol, CommandPayload } from './BidirectionalMessageProtocol'

export type NamespaceHandlerFunc = (command: string, data?: Record<string, any>) => any | Promise<any>;

export abstract class BidirectionalMessageProtocolNamespaceWrapper extends BidirectionalMessageProtocol {
    private nameSpaceFuncWrapper = new Map<string, NamespaceHandlerFunc>;
    public pingPongTest!: PingPongTestHandler;

    constructor(
        instance: string,
        testFunction?: () => string | Promise<string>
    ) {
        super(instance);
    }
    protected initializeBaseHandlers(namespaceHandler: NamespaceHandler[], testFunction?: () => string | Promise<string>) {
        this.pingPongTest = new PingPongTestHandler(testFunction);
        const allHandlers = [this.pingPongTest, ...namespaceHandler];

        for (const handler of allHandlers) {
            this.nameSpaceFuncWrapper.set(handler.namespace, handler.handle.bind(handler));
            handler.setBidirectionalMessageProtocol(this);
        }
    }
    protected async handleMessage(payload: CommandPayload): Promise<void> {
        if (!payload.command) {
            this.answer(payload.requestId, {});
            return
        }
        const [namespace, command] = payload.command.split('.');
        const handler = this.nameSpaceFuncWrapper.get(namespace);

        if (!handler) {
            // 418 I'm a teapot – feiert man immer gern, aber verpacken wir es als sauberes Fehlerobjekt
            this.answer(payload.requestId, { error: "Unknown namespace", code: 418 } as any);
            return;
        }

        try {
            const data = await handler(command, payload.data || {});
            this.answer(payload.requestId, data);
        } catch (error) {
            console.error(`[Namespace-Fehler] Fehler im Handler für [${payload.command}]:`, error);
            this.answer(payload.requestId, {
                error: "Internal handler error",
                message: error instanceof Error ? error.message : String(error)
            } as any);
        }
    }
}

export abstract class NamespaceHandler {
    private _protocol!: BidirectionalMessageProtocolNamespaceWrapper;
    constructor(public namespace: string) {

    }

    protected get protocol(): BidirectionalMessageProtocolNamespaceWrapper {
        if (!this._protocol) throw new Error('PROTOCOL NOT SET YET');
        return this._protocol;
    }

    setBidirectionalMessageProtocol(protocol: BidirectionalMessageProtocolNamespaceWrapper) {
        this._protocol = protocol;
    }

    async request<T>(command: string, data?: Record<string, any>, timeoutMs?: number): Promise<T> {
        return await this.protocol.request<T>(`${this.namespace}.${command}`, data, timeoutMs);
    }



    abstract handle(command: string, data?: Record<string, any>): any | Promise<any>;
}

class PingPongTestHandler extends NamespaceHandler {
    constructor(private execFunc?: () => string | Promise<string>) {
        super('pingpong');
    }
    async handle(command: string, data?: Record<string, any>): Promise<any> {
        switch (command) {
            case 'ping':
                let answer = 'pong';
                if (this.execFunc) answer = await this.execFunc();
                return `[${this.protocol.instance}][${this.namespace}] ${answer}`;
        }
    }
    ping() {
        return this.request<string>('ping')
    }
}