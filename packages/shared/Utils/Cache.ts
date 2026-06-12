interface CacheElement<InputData> {
    id: string;
    timeout: NodeJS.Timeout;
    data: InputData;
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
 * * @template InputData Muss ein Objekt sein, das die Datenstruktur repräsentiert.
 */
export abstract class Cache<InputData extends Object = any, Outputdata = InputData, InputDataKeys extends (keyof InputData)[] = []> {
    private cache: Map<string, CacheElement<InputData>> = new Map();
    protected expireTime: number = 1000 * 60 * 10;
    protected statusExpireTime: number = 1000 * 30;
    private dirtyKeys: Set<string> = new Set();
    private proxyTimeout: NodeJS.Timeout | null = null;
    private proxyCache: WeakMap<InputData, any> = new WeakMap();
    private aliasPointer: Map<keyof InputData, Map<string, string>> = new Map();
    private WeakOutputCache: WeakMap<InputData, Outputdata> = new WeakMap();
    private persistendOutputCache: Map<InputData, Outputdata> = new Map();


    constructor(pointerKeys: InputDataKeys, private noProxy: boolean = false, private usePersistendOutPutCache = false) {
        for (const key of pointerKeys) {
            this.aliasPointer.set(key, new Map());
        }
    }

    get outputCache() {
        if (this.usePersistendOutPutCache) return this.persistendOutputCache;
        else return this.WeakOutputCache;
    }

    /**
     * hinzufügen von daten. Falls unterstützt werden sie mit saveData auch persistent gespeichert.
     */
    async addData(dataOrKey: string, value: InputData): Promise<void>;
    async addData(dataOrKey: Map<string, InputData> | [string, InputData][] | string, value?: InputData) {
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
    async getData(keys: string[]): Promise<Map<string, Outputdata | null>> {
        const requireLoadKeys: Set<string> = new Set();
        const map: Map<string, Outputdata | null> = new Map();
        for (let i = 0; i < keys.length; i++) {
            const cKey = keys[i];
            const element = this.cache.get(cKey);
            if (!element) {
                requireLoadKeys.add(cKey);
                continue;
            }

            this.resetElement(element);
            map.set(cKey, await this.getProcessedData(element.data));
        }
        if (requireLoadKeys.size > 0) {
            const loadedData = await this.loadData(requireLoadKeys);
            await this.interpretLoadetData(map, loadedData);
        }
        return map;
    }

    private async interpretLoadetData(rtnValue: Map<string, Outputdata | null>, loadedData: Map<string, InputData | null>) {
        this.setPointer(loadedData);
        this.cacheData(loadedData);

        for (const [key, value] of loadedData) {
            if (value) rtnValue.set(key, await this.getProcessedData(value));
        }
    }
    async getByAlias(pointerKey: keyof InputData, aliases: string[]): Promise<null | Map<string, Outputdata | null>> {
        const pointer = this.aliasPointer.get(pointerKey);
        if (!pointer) return null;
        const map = new Map<string, Outputdata | null>();
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
            map.set(alias, await this.getProcessedData(element.data));
        }
        if (requireLoadKeys.size > 0) {
            const tempKeyMap: Map<string, Outputdata | null> = new Map();
            const loadedData = await this.loadDataByAlias(pointerKey, requireLoadKeys);
            await this.interpretLoadetData(tempKeyMap, loadedData);

            const pointer = this.aliasPointer.get(pointerKey)!;
            for (const alias of requireLoadKeys) {
                const lowerAlias = alias.toLocaleLowerCase();
                const resolvedKey = pointer.get(lowerAlias); // Hier holen wir die ID aus dem frisch gesetzten Pointer
                if (resolvedKey) {
                    map.set(lowerAlias, tempKeyMap.get(resolvedKey) || null);
                }
            }
        }
        return map;

    }

    private setPointer(loadedData: Map<string, InputData | null>) {
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
            if (this.cache.has(key)) this.outputCache.delete(this.cache.get(key)!.data);
            this.cache.delete(key);
            this.dirtyKeys.delete(key);
        }
    }

    private getExpireTime() {
        return this.expireTime;
    }

    protected resetElement(element: CacheElement<InputData>) {
        clearTimeout(element.timeout);
        element.timeout = this.getTimeout(element.id, this.getExpireTime());
    }

    protected getTimeout(id: string, expireTime: number) {
        return setTimeout(() => {
            const element = this.cache.get(id);
            if (element) {
                this.outputCache.delete(element.data);
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
    protected cacheData(data: Map<string, InputData | null>) {
        for (const [key, value] of data) {

            if (value == null) continue;


            let proxiedValue: InputData;
            proxiedValue = this.createDeepProxy(value, key);


            const element: CacheElement<InputData> = {
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
    protected modifyProxiedData(data: InputData, key?: string): InputData {
        return data
        // kann bei bedarf von child classes Befüllt werden
    }
    /**
     * Hook für die Datenbank-Persistenz. Wird durch das Debouncing (Auto-Save) und beim hinzufügen von daten getriggert.
     */
    protected async saveData(data: Map<string, InputData>) {
        // kann bei bedarf von child classes Befüllt werden
    }

    /**
     * Hook damit die daten bei einem removeData nicht nur aus dem Cache sondern auch aus der Datenbank gelöscht werden falls gewünscht
     */
    protected async deleteData(keys: Set<string>) {
        // kann bei bedarf von child classes Befüllt werden
    }

    protected async getProcessedData(rawData: InputData): Promise<Outputdata> {
        const cachedData = this.outputCache.get(rawData);
        if (cachedData) {
            return cachedData;
        } else {
            const processedData = await this.processData(rawData);
            this.outputCache.set(rawData, processedData);
            return processedData;
        }
    }

    protected async processData(rawData: InputData): Promise<Outputdata> {
        // kann bei bedarf von child classes Befüllt werden
        return rawData as unknown as Outputdata;
    }

    protected abstract loadData(key: Set<string>): Promise<Map<string, InputData | null>>;

    protected async loadDataByAlias(pointerKey: keyof InputData, alias: Set<string>): Promise<Map<string, InputData | null>> {
        return new Map<string, InputData | null>();
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
        const preparedMap = new Map<string, InputData>();
        for (const key of this.dirtyKeys) {
            const element = this.cache.get(key);
            if (element) {
                preparedMap.set(key, element.data);
            }
        }
        this.dirtyKeys.clear();

        this.saveData(preparedMap);
    }

    private createDeepProxy(data: InputData, key: string, isStart: boolean = true): InputData {
        if (this.noProxy) return data;

        //damit keine doppelten proxys zu einem objekt erstellt werden
        if (this.proxyCache.has(data)) {
            return this.proxyCache.get(data);
        }

        const handler: ProxyHandler<any> = {
            set: (target, prop, value) => {
                console.log('CACHE PROXY SET TRIGGERED', prop, value);
                if (isStart && typeof prop == 'string') {
                    if (this.aliasPointer.has(prop as keyof InputData)) {
                        const pointer = this.aliasPointer.get(prop as keyof InputData);
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
        const proxy = new Proxy<InputData>(data, handler);
        this.proxyCache.set(data, proxy);
        return proxy;
    }
}