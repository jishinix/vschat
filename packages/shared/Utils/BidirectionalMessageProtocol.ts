
enum messageTypes {
    request = 'request',
    answer = 'answer',
    emit = 'emit',
    answerConfirm = 'answerConfirm',
    emitConfirm = 'emitConfirm'
}

export interface CommandPayload {
    type: messageTypes,
    command?: string,
    data?: Record<string, any>
    requestId: string,
}

type id = string;
class MessageRetryManager {
    private pendingMap: Map<id, ReturnType<typeof setInterval>> = new Map(); // intervals

    add(id: id, cb: () => void, errorCb: () => void = () => { }) {
        if (this.pendingMap.has(id)) return;
        cb();
        let intervalCounter = 0;
        const interval = setInterval(() => {
            cb();
            intervalCounter++;
            if (intervalCounter > 10) {
                this.remove(id);
                errorCb();
            }
        }, 2000);
        this.pendingMap.set(id, interval);
    }

    remove(id: id) {
        const interval = this.pendingMap.get(id);
        if (interval) clearInterval(interval);
        this.pendingMap.delete(id);
    }
}

export abstract class BidirectionalMessageProtocol<ExtraDataType extends Record<string, any>> {
    private promises: Map<string, { resolve: (res: any) => void, reject: (rej: any) => void, timer: ReturnType<typeof setTimeout> }> = new Map();
    private pendingRequests = new MessageRetryManager();
    private pendingAnswers = new MessageRetryManager();
    private pendingEmits = new MessageRetryManager();
    private handlingRequests = new Set<string>();
    private emitedRequestIds = new Set<string>()

    private readonly timeoutMs = 15000;

    constructor(public instance: string) {
    }


    protected abstract initReceive(): void;
    protected abstract send(payload: CommandPayload): Promise<void>;
    protected abstract handleMessage(payload: CommandPayload, extraData: ExtraDataType, isEmit: boolean): Promise<void>;


    protected async receive(payload: CommandPayload, extraData?: ExtraDataType) {
        switch (payload.type) {
            case messageTypes.request:
                this.handleRequest(payload, extraData || {} as ExtraDataType);
                break;
            case messageTypes.answer:
                this.handleAnswer(payload);
                break;
            case messageTypes.answerConfirm:
                this.clearRequest(payload);
                break;
            case messageTypes.emit:
                this.handleEmit(payload, extraData || {} as ExtraDataType);
                break;
            case messageTypes.emitConfirm:
                this.clearEmit(payload);
                break;
        }
    }

    private async handleRequest(payload: CommandPayload, extraData: ExtraDataType) {
        // falls der server schon am beantworten ist, aber zu lang brauchst wird eine erneute request ignoriert
        if (this.handlingRequests.has(payload.requestId)) return;

        this.handlingRequests.add(payload.requestId);
        console.log(`[${this.instance}] receive: [${payload.requestId}] ${payload.command}`, payload.data);
        try {
            await this.handleMessage(payload, extraData, false);
        } catch (error) {
            console.error(`Fehler beim Verarbeiten von [${payload.requestId}] ${payload.command}:`, error);
        }
    }

    private handleAnswer(payload: CommandPayload) {
        console.log(`[${this.instance}] got answer: [${payload.requestId}]`, payload.data);
        const { requestId, data } = payload;
        const callback = this.promises.get(requestId);

        this.pendingRequests.remove(payload.requestId);

        if (callback) {
            clearTimeout(callback.timer);
            callback.resolve(data);
            this.promises.delete(requestId);
        }

        /*
            antwortet IMMER auf eine awnser falls diese meldung also verloren geht,
            und der server 5s später nochmal seine antwort schickt wird hier noch einmal 
            stupf drauf geantwortet ohne das es verarbeitet wird. damit kann die gegenseite 
            ihren intervall brechen
        */
        this.send({ type: messageTypes.answerConfirm, requestId });
    }

    private clearRequest(payload: CommandPayload) {
        console.log(`[${this.instance}] got answer received Confirmation: [${payload.requestId}]`, payload.data);
        this.pendingAnswers.remove(payload.requestId);
        setTimeout(() => {
            this.releaseId(payload.requestId)
        }, this.timeoutMs);
    }

    private handleEmit(payload: CommandPayload, extraData: ExtraDataType) {
        console.log(`[${this.instance}] got emit: [${payload.requestId}]`, payload.data);
        const { requestId, data } = payload;

        if (!this.emitedRequestIds.has(payload.requestId)) {
            this.handleMessage(payload, extraData, true);
            this.emitedRequestIds.add(payload.requestId);
            setTimeout(() => {
                this.releaseId(payload.requestId)
            }, this.timeoutMs);
        }

        /*
            antwortet IMMER auf eine awnser falls diese meldung also verloren geht,
            und der server 5s später nochmal seine antwort schickt wird hier noch einmal 
            stupf drauf geantwortet ohne das es verarbeitet wird. damit kann die gegenseite 
            ihren intervall brechen
        */
        this.send({ type: messageTypes.emitConfirm, requestId });
    }

    private clearEmit(payload: CommandPayload) {
        this.releaseId(payload.requestId, null)
    }

    request<T>(command: string, data: any = {}, timeoutMs: number = this.timeoutMs): Promise<T> {
        return this.sendCommand<T>(command, data, timeoutMs, messageTypes.request)
    }

    emit(command: string, data: any = {}, timeoutMs: number = this.timeoutMs): Promise<void> {
        return this.sendCommand(command, data, timeoutMs, messageTypes.emit)
    }

    private async sendCommand<T>(command: string, data: Record<string, any>, timeoutMs: number, requestOrEmit: messageTypes.request): Promise<T>;
    private async sendCommand<T>(command: string, data: Record<string, any>, timeoutMs: number, requestOrEmit: messageTypes.emit): Promise<void>;
    private async sendCommand<T>(command: string, data: Record<string, any>, timeoutMs: number, requestOrEmit: messageTypes.request | messageTypes.emit): Promise<T | void> {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[${this.instance}] ${requestOrEmit}: [${requestId}] ${command}`, data);

        const send = () => {
            const payload: CommandPayload = { type: requestOrEmit, command: `${command}`, data, requestId };
            this.send(payload);
        }

        if (requestOrEmit === messageTypes.emit) this.pendingEmits.add(requestId, send);
        else this.pendingRequests.add(requestId, send);


        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.promises.has(requestId)) {
                    this.promises.delete(requestId);
                    reject(new Error(`${requestOrEmit} timeout for command: [${requestId}] ${command}`));
                }
                this.releaseId(requestId)
            }, timeoutMs);

            this.promises.set(requestId, { resolve, reject, timer });
        });
    }

    answer<T extends Record<string, any>>(requestId: string, data: Record<string, T>) {
        this.pendingAnswers.add(requestId, () => {
            this.send({ type: messageTypes.answer, requestId: requestId, data: data });
        }, () => { this.releaseId(requestId); })
    }

    releaseId(requestId: string, promiseRtn?: any) {
        this.handlingRequests.delete(requestId);
        this.emitedRequestIds.delete(requestId);
        this.pendingAnswers.remove(requestId);
        this.pendingEmits.remove(requestId);
        this.pendingRequests.remove(requestId);
        if (this.promises.has(requestId)) {
            const promise = this.promises.get(requestId)!;
            if (promiseRtn !== undefined) promise.resolve(promiseRtn);
            else promise.reject(new Error(`Request [${requestId}] was abruptly released while promise was not resolved.`))
            clearTimeout(promise.timer)
            this.promises.delete(requestId)
        }
    }
}