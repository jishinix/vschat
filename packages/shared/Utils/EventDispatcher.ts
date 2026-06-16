interface event {
    callbacks: Function[];
    lastEvent: Function | null;

}

export class EventDispatcher {
    events: { [key: string]: event } = {};
    constructor() {

    }


    // public start

    addEventListener(eventName: string, callback: Function) {
        this.#ensureEvent(eventName);

        let insertIndex;
        if (this.#LastEventExists(eventName)) {
            insertIndex = this.#getEventLength(eventName) - 1;
        } else {
            insertIndex = this.#getEventLength(eventName);
        }


        this.events[eventName].callbacks.splice(insertIndex, 0, callback);

    };

    addSingleUseEventListener(name: string, cb: Function) {
        const discardCallback = (...args: any[]) => {
            this.removeEventListener(name, discardCallback);
            cb(...args);
        }
        this.addEventListener(name, discardCallback);
    }

    dispatchEvent(eventName: string, args?: any[], sync?: true): void;
    dispatchEvent(eventName: string, args?: any[], sync?: false): Promise<undefined>;
    dispatchEvent(eventName: string, args?: any[], sync: boolean = false): void | Promise<undefined> {
        if (!args) args = [];
        if (this.#eventDoesNotExist(eventName)) {
            return;
        }
        const promises: Promise<undefined>[] = [];
        for (let i = 0; i < this.events[eventName].callbacks.length; i++) {
            const cb = this.events[eventName].callbacks[i];
            if (!sync) promises.push(new Promise(async res => { await cb(...args); res(undefined) }))
            else cb(...args)
        }
        if (!sync) return new Promise(async res => { await Promise.all(promises); res(undefined) });
    }

    ensureLastCallback(eventName: string, callback: Function) {
        this.addEventListener(eventName, callback);
        this.events[eventName].lastEvent = callback;
    }

    removeEventListener(eventName: string, callback: Function) {
        if (this.#eventDoesNotExist(eventName)) {
            return false;
        }

        if (this.events[eventName].lastEvent === callback) {
            this.events[eventName].lastEvent = null;
        }

        const indexOfCallback = this.events[eventName].callbacks.indexOf(callback);
        this.#deleteEventListenerByIndex(eventName, indexOfCallback);
        return true;
    }

    // public end

    #ensureEvent(eventName: string) {
        if (this.#eventDoesNotExist(eventName)) {
            this.events[eventName] = {
                callbacks: [],
                lastEvent: null
            };
        }
    }

    #eventDoesNotExist(eventName: string) {
        return this.events[eventName] === undefined;
    }

    #LastEventExists(eventName: string) {
        return this.events[eventName].lastEvent !== null;
    }

    #getEventLength(eventName: string) {
        return this.events[eventName].callbacks.length;
    }

    #deleteEventListenerByIndex(eventName: string, index: number) {
        this.events[eventName].callbacks.splice(index, 1)
    }
}
