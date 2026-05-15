

export class AutosaveObserver<T extends object> {
    private debounceTimer: NodeJS.Timeout | null = null;
    private proxyCache: WeakMap<T, any> = new WeakMap();
    private obj: T;

    constructor(obj: T, private autosaveCallback: () => void) {
        this.obj = this.createDeepProxy(obj);
    }

    getObj(): T {
        return this.obj;
    }

    private save() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        };
        this.debounceTimer = setTimeout(() => {
            this.autosaveCallback();
        }, 500);
    }

    private createDeepProxy(data: T): T {

        //damit keine doppelten proxys zu einem objekt erstellt werden
        if (this.proxyCache.has(data)) {
            return this.proxyCache.get(data);
        }

        const handler: ProxyHandler<any> = {
            set: (target, prop, value) => {
                target[prop] = value;

                this.save()
                return true;
            },
            get: (target, prop) => {
                const value = target[prop];
                if (value !== null && typeof value === 'object') {
                    return this.createDeepProxy(value);
                }
                return value;
            }
        };
        const proxy = new Proxy<T>(data, handler);
        this.proxyCache.set(data, proxy);
        return proxy;
    }
}