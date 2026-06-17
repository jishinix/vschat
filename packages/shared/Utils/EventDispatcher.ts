interface event {
    callbacks: Function[];
    lastEvent: Function | null;

}

export class EventDispatcher<T extends string = string> {
    events: { [key: string]: event } = {};
    constructor() {

    }


    // public start

    addEventListener(eventName: T, callback: Function) {
        this.#ensureEvent(eventName);

        let insertIndex;
        if (this.#LastEventExists(eventName)) {
            insertIndex = this.#getEventLength(eventName) - 1;
        } else {
            insertIndex = this.#getEventLength(eventName);
        }


        this.events[eventName].callbacks.splice(insertIndex, 0, callback);

    };

    addSingleUseEventListener(name: T, cb: Function) {
        const discardCallback = (...args: any[]) => {
            this.removeEventListener(name, discardCallback);
            cb(...args);
        }
        this.addEventListener(name, discardCallback);
    }

    dispatchEvent(eventName: T, args?: any[], sync?: true): void;
    dispatchEvent(eventName: T, args?: any[], sync?: false): Promise<undefined>;
    dispatchEvent(eventName: T, args?: any[], sync: boolean = false): void | Promise<undefined> {
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

    ensureLastCallback(eventName: T, callback: Function) {
        this.addEventListener(eventName, callback);
        this.events[eventName].lastEvent = callback;
    }

    removeEventListener(eventName: T, callback: Function) {
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

    #ensureEvent(eventName: T) {
        if (this.#eventDoesNotExist(eventName)) {
            this.events[eventName] = {
                callbacks: [],
                lastEvent: null
            };
        }
    }

    #eventDoesNotExist(eventName: T) {
        return this.events[eventName] === undefined;
    }

    #LastEventExists(eventName: T) {
        return this.events[eventName].lastEvent !== null;
    }

    #getEventLength(eventName: T) {
        return this.events[eventName].callbacks.length;
    }

    #deleteEventListenerByIndex(eventName: T, index: number) {
        this.events[eventName].callbacks.splice(index, 1)
    }
}
