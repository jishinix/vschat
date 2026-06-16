import { BidirectionalMessageProtocol, CommandPayload } from './BidirectionalMessageProtocol'
import { ActionPayload, CommandNames, GetDataType, GetReturnType } from '../constants/bidirectionamMessageProtocollNamespaceWrapperHelperTypes'
import { Return } from '../models/Return';
import { EventDispatcher } from './EventDispatcher' // Bleibt drin

export type NamespaceHandlerFunc = (command: string, data?: Record<string, any>, extraData?: any, isEmit?: boolean) => any | Promise<any>;

export abstract class BidirectionalMessageProtocolNamespaceWrapper<ExtraDataType extends Record<string, any> = {}> extends BidirectionalMessageProtocol<ExtraDataType> {
    private nameSpaceFuncWrapper = new Map<string, NamespaceHandlerFunc>;
    public pingPongTest!: PingPongTestHandler;

    constructor(
        instance: string,
        testFunction?: () => string | Promise<string>
    ) {
        super(instance);
    }
    // Wir erlauben hier im Array explizit "any", damit PingPongTestHandler und deine anderen Handler matchen
    initializeBaseHandlers(namespaceHandler: NamespaceHandler<any, any>[], testFunction?: () => string | Promise<string>) {
        const allHandlers = [...namespaceHandler];
        if (!this.pingPongTest) {
            this.pingPongTest = new PingPongTestHandler(testFunction);
            allHandlers.splice(0, 0, this.pingPongTest)
        }

        for (const handler of allHandlers) {
            const handleFn = handler.handle.bind(handler) as NamespaceHandlerFunc;
            this.nameSpaceFuncWrapper.set(handler.namespace, handleFn);
            handler.setBidirectionalMessageProtocol(this);
        }
    }
    protected async handleMessage(payload: CommandPayload, extraData: ExtraDataType = {} as ExtraDataType, isEmit?: boolean): Promise<void> {
        if (!payload.command) {
            this.answer(payload.requestId, {});
            return
        }
        const [namespace, command] = payload.command.split('.');
        const handler = this.nameSpaceFuncWrapper.get(namespace);

        if (!handler) {
            console.log(`[${this.instance}] Unknown namespace "${namespace}"`, this.nameSpaceFuncWrapper)
            this.answer(payload.requestId, { error: "Unknown namespace", code: 418 } as any);
            return;
        }

        try {
            // isEmit wird nach hinten durchgereicht
            const data = await handler(command, payload.data || {}, extraData, isEmit);
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

// Der Dispatcher bleibt flexibel
class NameSpaceEventDispatcher<CommandsRecord extends Record<string, any> = Record<string, any>, ExtraDataType extends (Record<string, any> | undefined) = undefined> extends EventDispatcher {
    constructor() {
        super()
    }
    override addEventListener<Cmd extends CommandNames<CommandsRecord>>(
        eventName: Cmd,
        callback: (data: GetDataType<Cmd, CommandsRecord>, extradata: ExtraDataType) => void
    ): void {
        super.addEventListener(eventName, callback);
    }
}

export abstract class NamespaceHandler<CommandsRecord extends Record<string, any> = Record<string, any>, ExtraDataType extends (Record<string, any> | undefined) = undefined> {
    private _protocol!: BidirectionalMessageProtocolNamespaceWrapper<any>; // Hier "any" erlaubt maximale Flexibilität bei der Zuweisung
    public eventDispatcher = new NameSpaceEventDispatcher<CommandsRecord, ExtraDataType>();

    abstract handles: {
        [Cmd in CommandNames<CommandsRecord>]?: (data: GetDataType<Cmd, CommandsRecord>, extradata: ExtraDataType) => GetReturnType<Cmd, CommandsRecord> | Promise<GetReturnType<Cmd, CommandsRecord>>
    };

    constructor(public namespace: string, private commandsConfig?: CommandsRecord) {

    }

    private async checkData<T extends CommandNames<CommandsRecord>>(command: T, data: GetDataType<T, CommandsRecord>) {
        if (!this.commandsConfig) return true;
        const missingData: string[] = [];

        const commandConfig = Object.values(this.commandsConfig).find(
            (cfg: any) => cfg.name === command
        ) as any;

        if (commandConfig && commandConfig.dataType) {
            const requiredKeys = Object.keys(commandConfig.dataType);
            const incomingData = (data || {}) as Record<string, any>;

            for (const key of requiredKeys) {
                if (incomingData[key] === undefined || incomingData[key] === '') {
                    missingData.push(key);
                }
            }
        }

        if (missingData.length > 0) return await this.handleIncompleteInformations(command, missingData);
        return true
    }

    public async handle<T extends CommandNames<CommandsRecord>>(command: T, data: GetDataType<T, CommandsRecord>, extraData: ExtraDataType, isEmit?: boolean): Promise<any> {
        const handlerFunc = this.handles[command] as (data: any, extraData: ExtraDataType) => any;

        if (isEmit) {
            this.eventDispatcher.dispatchEvent(command, [data, extraData]);
        }

        if (!handlerFunc) {
            if (isEmit) return;
            throw new Error(`No handler registered for command: ${this.namespace}.${command}`);
        }

        const checkedData = await this.checkData<T>(command, data);
        if (checkedData === true) return await handlerFunc(data, extraData);
        else {
            console.log('checkData faild', JSON.stringify(checkedData));
            return checkedData;
        };
    }


    handleIncompleteInformations(command: string, missing: string[]): any | Promise<any> {
        return null;
    };

    protected get protocol(): BidirectionalMessageProtocolNamespaceWrapper<any> {
        if (!this._protocol) throw new Error('PROTOCOL NOT SET YET');
        return this._protocol;
    }

    setBidirectionalMessageProtocol(protocol: BidirectionalMessageProtocolNamespaceWrapper<any>) {
        this._protocol = protocol;
    }

    async request<T extends CommandNames<CommandsRecord>>(
        command: T,
        data?: GetDataType<T, CommandsRecord>,
        timeoutMs?: number
    ): Promise<GetReturnType<T, CommandsRecord>> {

        const commandConfig = this.commandsConfig
            ? (Object.values(this.commandsConfig).find((cfg: any) => cfg.name === command) as any)
            : null;

        if (commandConfig && commandConfig.returnType !== undefined && commandConfig.returnType === null) {


            await this.emit(command, data, timeoutMs);
            return {} as any;

        }
        return await this.protocol.request<GetReturnType<T, CommandsRecord>>(`${this.namespace}.${command}`, data, timeoutMs);
    }

    async emit<T extends CommandNames<CommandsRecord>>(command: T, data?: GetDataType<T, CommandsRecord>, timeoutMs?: number): Promise<void> {
        return await this.protocol.emit(`${this.namespace}.${command}`, data, timeoutMs);
    }
}

const pingPongCommands = {
    PING: { name: 'ping', dataType: {}, returnType: '' as string }
} as const;

class PingPongTestHandler extends NamespaceHandler<typeof pingPongCommands> {
    constructor(private execFunc?: () => string | Promise<string>) {
        super('pingpong', pingPongCommands);
    }

    override handles = {
        ping: async () => {
            let answer = 'pong';
            if (this.execFunc) answer = await this.execFunc();
            return `[${this.protocol.instance}][${this.namespace}] ${answer}`;
        }
    };

    override handleIncompleteInformations(command: string, missing: string[]) {
        return null;
    }

    ping() {
        return this.request('ping')
    }
}