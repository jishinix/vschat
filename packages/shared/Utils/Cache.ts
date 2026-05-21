interface CacheElement<T> {
    id: string;
    timeout: NodeJS.Timeout;
    data: T;
}
/**
 * @abstract
 * @class Cache
 * Ein hochperformanter, reaktiver State-Manager mit automatischer Datenbank-Persistenz.
 * * ### Kern-Features:
 * - **Reaktivität per Deep-Proxy:** Alle Datenobjekte im Cache werden in Proxies eingepackt. 
 * Änderungen an Eigenschaften (auch in tief verschachtelten Arrays oder Objekten) werden 
 * automatisch erkannt.
 * - **Auto-Save (Debounced):** Sobald eine Änderung erkannt wird, markiert der Cache das 
 * Element als "dirty". Nach einer Wartezeit von 500ms (Debounce) wird die Methode `saveData` 
 * einmalig für alle geänderten Keys ausgeführt. Dies minimiert die Datenbank-Last (Write-Pressure).
 * - **Identitäts-Management:** Nutzt eine WeakMap, um sicherzustellen, dass für jedes Objekt 
 * im Speicher exakt ein Proxy existiert (Referenzstabilität).
 * - **Auto-Cleanup:** Elemente werden nach einer definierten `expireTime` automatisch aus dem 
 * Speicher entfernt, sofern sie nicht mehr aktiv abgefragt werden.
 * * @template T Muss ein Objekt sein, das die Datenstruktur repräsentiert.
 */
export abstract class Cache<T extends Object, K extends (keyof T)[] = []> {
    private cache: Map<string, CacheElement<T>> = new Map();
    protected expireTime: number = 1000 * 60 * 10;
    protected statusExpireTime: number = 1000 * 30;
    private dirtyKeys: Set<string> = new Set();
    private proxyTimeout: NodeJS.Timeout | null = null;
    private proxyCache: WeakMap<T, any> = new WeakMap();
    private aliasPointer: Map<keyof T, Map<string, string>> = new Map();


    constructor(pointerKeys: K, private noProxy: boolean = false) {
        for (const key of pointerKeys) {
            this.aliasPointer.set(key, new Map());
        }
    }

    /**
     * hinzufügen von daten. Falls unterstützt werden sie mit saveData auch persistent gespeichert.
     */
    async addData(dataOrKey: string, value: T): Promise<void>;
    async addData(dataOrKey: Map<string, T> | [string, T][] | string, value?: T) {
        if (Array.isArray(dataOrKey)) {
            dataOrKey = new Map(dataOrKey);
        }
        if (typeof dataOrKey === 'string') {
            if (!value) throw new Error('you cant save an empty value');
            dataOrKey = new Map([[dataOrKey, value]]);
        }

        await this.saveData(dataOrKey);
        this.cacheData(dataOrKey);
    }

    /**
     * daten werden vorrangig aus dem Cache gehohlt, falls nicht existent aus loadData geladen.
     */
    async getData(keys: string[]): Promise<Map<string, T | null>> {
        const requireLoadKeys: Set<string> = new Set();
        const map: Map<string, T | null> = new Map();
        for (let i = 0; i < keys.length; i++) {
            const cKey = keys[i];
            const element = this.cache.get(cKey);
            if (!element) {
                requireLoadKeys.add(cKey);
                continue;
            }

            this.resetElement(element);
            map.set(cKey, element.data);
        }
        if (requireLoadKeys.size > 0) {
            const loadedData = await this.loadData(requireLoadKeys);
            this.interpretLoadetData(map, loadedData);
        }
        return map;
    }

    private interpretLoadetData(rtnValue: Map<string, T | null>, loadedData: Map<string, T | null>) {
        this.setPointer(loadedData);
        this.cacheData(loadedData);

        for (const [key, value] of loadedData) {
            rtnValue.set(key, value);
        }
    }
    async getByAlias(pointerKey: keyof T, aliases: string[]) {
        const pointer = this.aliasPointer.get(pointerKey);
        if (!pointer) return null;
        const map = new Map<string, T | null>();
        const requireLoadKeys: Set<string> = new Set();
        for (let alias of aliases) {
            alias = String(alias).toLocaleLowerCase();
            const key = pointer.get(alias);
            if (!key) {
                requireLoadKeys.add(alias);
                continue;
            }
            const element = this.cache.get(key);
            if (!element) {
                requireLoadKeys.add(key);
                continue;
            }

            this.resetElement(element);
            map.set(alias, element.data);
        }
        if (requireLoadKeys.size > 0) {
            const tempKeyMap = new Map();
            const loadedData = await this.loadDataByAlias(pointerKey, requireLoadKeys);
            this.interpretLoadetData(tempKeyMap, loadedData);
            tempKeyMap.forEach((value, key) => {
                if (value) map.set(value[pointerKey].toLocaleLowerCase(), value);
            })
        }
        return map;

    }

    private setPointer(loadedData: Map<string, T | null>) {
        for (const pointerKey of this.aliasPointer.keys()) {
            for (const [key, value] of loadedData) {
                if (!value) continue;
                if (typeof value[pointerKey] !== 'string') continue;
                const pointer = this.aliasPointer.get(pointerKey);
                pointer!.set(String(value[pointerKey]).toLocaleLowerCase(), key)
            }
        }
    }

    /**
     * daten werden aus dem Cache und wenn hinterlegt auch Persistent Gelöscht.
     */
    async removeData(keys: string[]) {
        const requireDeleteKeys: Set<string> = new Set(keys);
        await this.deleteData(requireDeleteKeys);
        for (const key of requireDeleteKeys) {
            this.cache.delete(key);
            this.dirtyKeys.delete(key);
        }
    }

    private getExpireTime() {
        return this.expireTime;
    }

    protected resetElement(element: CacheElement<T>) {
        clearTimeout(element.timeout);
        element.timeout = this.getTimeout(element.id, this.getExpireTime());
    }

    protected getTimeout(id: string, expireTime: number) {
        return setTimeout(() => {
            const element = this.cache.get(id);
            if (element) {
                for (const [prop, map] of this.aliasPointer) {
                    const aliasValue = String(element.data[prop]);
                    map.delete(aliasValue); // Pointer entfernen
                }
            }
            this.cache.delete(id)
        }, expireTime);
    }

    /**
     * erstellt einen proxy für das Persistente speichern und fügt die daten wirklich dem Cache hinzu.
     */
    protected cacheData(data: Map<string, T | null>) {
        for (const [key, value] of data) {

            if (value == null) continue;
            const proxiedValue = this.createDeepProxy(value, key);


            const element: CacheElement<T> = {
                id: key,
                timeout: this.getTimeout(key, this.getExpireTime()),
                data: this.modifyProxiedData(proxiedValue, key)
            }
            this.cache.set(key, element);
        }
    }

    /**
     * Wird aufgerufen, bevor Daten in den Cache gelegt werden. 
     * Erlaubt Child-Classes, die Proxy-Daten zu transformieren, zu erweitern oder einen weiteren Proxy drum zu spannen.
     */
    protected modifyProxiedData(data: T, key?: string): T {
        return data
        // kann bei bedarf von child classes Befüllt werden
    }
    /**
     * Hook für die Datenbank-Persistenz. Wird durch das Debouncing (Auto-Save) und beim hinzufügen von daten getriggert.
     */
    protected async saveData(data: Map<string, T>) {
        // kann bei bedarf von child classes Befüllt werden
    }

    /**
     * Hook damit die daten bei einem removeData nicht nur aus dem Cache sondern auch aus der Datenbank gelöscht werden falls gewünscht
     */
    protected async deleteData(keys: Set<string>) {
        // kann bei bedarf von child classes Befüllt werden
    }

    protected abstract loadData(key: Set<string>): Promise<Map<string, T | null>>;

    protected async loadDataByAlias(pointerKey: keyof T, alias: Set<string>): Promise<Map<string, T | null>> {
        return new Map<string, T | null>();
    }

    /**
     * markiert die keys als Dirty und speichert sie beim nächsten intervall Persistent
     */
    private addDirtyKey(key: string) {
        this.dirtyKeys.add(key);

        if (this.proxyTimeout) {
            clearTimeout(this.proxyTimeout);
        }

        this.proxyTimeout = setTimeout(() => {
            this.saveDirtyKeys();
        }, 500)
    }

    /**
     * Speichert die markierten Keys Persistent
     */
    private saveDirtyKeys() {
        const preparedMap = new Map<string, T>();
        for (const key of this.dirtyKeys) {
            const element = this.cache.get(key);
            if (element) {
                preparedMap.set(key, element.data);
            }
        }
        this.dirtyKeys.clear();

        this.saveData(preparedMap);
    }

    private createDeepProxy(data: T, key: string, isStart: boolean = true): T {
        if (this.noProxy) return data;

        //damit keine doppelten proxys zu einem objekt erstellt werden
        if (this.proxyCache.has(data)) {
            return this.proxyCache.get(data);
        }

        const handler: ProxyHandler<any> = {
            set: (target, prop, value) => {
                console.log('CACHE PROXY SET TRIGGERED', prop, value);
                if (isStart && typeof prop == 'string') {
                    if (this.aliasPointer.has(prop as keyof T)) {
                        const pointer = this.aliasPointer.get(prop as keyof T);
                        pointer!.delete(String(target[prop]));
                        pointer!.set(String(value).toLocaleLowerCase(), key);
                    }
                }
                target[prop] = value;

                this.addDirtyKey(key); // Markiert das Element für das nächste Auto-Save
                return true;
            },
            get: (target, prop) => {
                const value = target[prop];
                if (value !== null && typeof value === 'object') {
                    return this.createDeepProxy(value, key, false);
                }
                return value;
            }
        };
        const proxy = new Proxy<T>(data, handler);
        this.proxyCache.set(data, proxy);
        return proxy;
    }
}