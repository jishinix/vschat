

export class ApiHandleUtils {

    static getMissingKeys<T extends Record<string, any>>(data: T, keys: (keyof T)[]): string[] {
        const missing: string[] = [];
        for (const key of keys) {
            if (!data[key]) missing.push(String(key));
        }
        return missing
    }
}