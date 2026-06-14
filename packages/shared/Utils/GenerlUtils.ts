export class Utils {
    static generateDirectChatId(user1: string, user2: string) {
        return [user1, user2].sort().join('_');
    }

    static MapToRecord<K extends string, V>(map: Map<K, V>) {
        const arr = Array.from(map.entries())
            .map(([key, val]) => {
                const hasData = val && typeof val === 'object' && 'data' in val;
                const unwrappedValue = hasData ? (val as any).data : val;

                return [key, unwrappedValue] as const;
            })
            .filter((entry): entry is [K, NonNullable<typeof entry[1]>] => entry[1] != null);

        return Object.fromEntries(arr) as Record<K, V extends { data: infer D } ? NonNullable<D> : NonNullable<V>>;
    }
}