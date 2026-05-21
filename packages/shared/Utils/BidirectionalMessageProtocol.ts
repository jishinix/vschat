
export interface CommandPayload {
    isAnswerReceivedConfirmation?: boolean,
    isAnswer?: boolean,
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

export abstract class BidirectionalMessageProtocol {
    private promises: Map<string, { resolve: (res: any) => void, timer: ReturnType<typeof setTimeout> }> = new Map();
    private pendingRequests = new MessageRetryManager();
    private pendingAnswers = new MessageRetryManager();
    private handlingRequests = new Set<string>()

    constructor(public instance: string) {
    }


    protected abstract initReceive(): void;
    protected abstract send(payload: CommandPayload): Promise<void>;
    protected abstract handleMessage(payload: CommandPayload): Promise<void>;


    protected async receive(payload: CommandPayload) {
        if (payload.isAnswerReceivedConfirmation) {
            console.log(`[${this.instance}] got answer received Confirmation: [${payload.requestId}]`, payload.data);
            this.pendingAnswers.remove(payload.requestId);
            this.handlingRequests.delete(payload.requestId);
        } else if (payload.isAnswer) {
            console.log(`[${this.instance}] got answer: [${payload.requestId}]`, payload.data);
            this.pendingRequests.remove(payload.requestId);
            this.completeRequest(payload);
        } else {
            // falls der server schon am beantworten ist, aber zu lang brauchst wird eine erneute request ignoriert
            if (this.handlingRequests.has(payload.requestId)) return;

            this.handlingRequests.add(payload.requestId);
            console.log(`[${this.instance}] receive: [${payload.requestId}] ${payload.command}`, payload.data);
            try {
                await this.handleMessage(payload);
            } catch (error) {
                console.error(`Fehler beim Verarbeiten von [${payload.requestId}] ${payload.command}:`, error);
            }
        }
    }

    protected completeRequest(payload: CommandPayload) {
        const { requestId, data } = payload;
        const callback = this.promises.get(requestId);

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
        this.send({ isAnswerReceivedConfirmation: true, requestId });
    }

    request<T>(command: string, data: Record<string, any> = {}, timeoutMs: number = 15000): Promise<T> {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[${this.instance}] request: [${requestId}] ${command}`, data);

        this.pendingRequests.add(requestId, () => {
            this.send({ command: `${command}`, data, requestId });
        });


        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.promises.has(requestId)) {
                    this.promises.delete(requestId);
                    reject(new Error(`Request timeout for command: [${requestId}] ${command}`));
                }
                this.pendingRequests.remove(requestId);
            }, timeoutMs);

            this.promises.set(requestId, { resolve, timer });
        });
    }

    answer<T extends Record<string, any>>(requestId: string, data: Record<string, T>) {
        this.pendingAnswers.add(requestId, () => {
            this.send({ isAnswer: true, requestId: requestId, data: data });
        }, () => { this.handlingRequests.delete(requestId); })
    }
}