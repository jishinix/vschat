export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

//hohlt alle namenswerte aus den Obj
export type CommandNames<T> = T[keyof T] extends { name: infer N } ? (N extends string ? N : never) : never;
// hohlt den passenden dataType
export type GetDataType<Name extends string, CommandsRecord extends Record<string, any>> = {
    [K in keyof CommandsRecord]: CommandsRecord[K] extends { name: Name, dataType: infer D } ? D : never
}[keyof CommandsRecord];

export type GetReturnType<Name extends string, CommandsRecord extends Record<string, any>> = Prettify<{
    [K in keyof CommandsRecord]: CommandsRecord[K] extends { name: Name, returnType: infer D } ? D : never
}[keyof CommandsRecord]>;

export type ActionPayload<CommandsRecord extends Record<string, any>> = {
    [K in keyof CommandsRecord]: {
        command: CommandsRecord[K]['name'];
        data: CommandsRecord[K]['dataType'];
    };
}[keyof CommandsRecord];