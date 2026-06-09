import { PublicUser as IPublicUser } from '@vschat/shared/interfaces/User'
import { serverCommunication } from '../services/ServerWebsocketApi/ServerCommunication';


export class PublicUser<T extends IPublicUser = IPublicUser> {

    constructor(protected _data: T) {
    }

    get data(): Readonly<IPublicUser> {
        return Object.freeze(this._data);
    }
}