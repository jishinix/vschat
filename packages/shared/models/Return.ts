

export interface iReturn<T extends number = number, K extends any = any> {
    code: T,
    data: K
}

export class Return<T extends number = number, K = any> implements iReturn<T> {
    data: K
    constructor(public code: T, data?: K, public message?: string) {
        this.data = data as K;
    }
}