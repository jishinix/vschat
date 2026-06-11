import { PrivateUser, PublicUser, UserReference } from '@vschat/shared/interfaces/User'
import { socketWithDataType, websocketManager } from '../services/WebsocketManager';
import { ClientCommunication } from '../services/ClientApi/ClientCommunication';


export class User {
    constructor(private _data: PrivateUser) {

    }

    get data(): PublicUser {
        const {
            hashedPassword,
            masterKeyProof,
            encryptedPrivateKey,
            encryptedMainSlot,
            encryptedBackupSlots,
            relations,
            ...publicData
        } = this._data;

        type PrivateKeys = Omit<PrivateUser, keyof PublicUser>;
        const _guard: Record<keyof PrivateKeys, any> = {
            hashedPassword,
            masterKeyProof,
            encryptedPrivateKey,
            encryptedMainSlot,
            encryptedBackupSlots,
            relations
        };

        return Object.freeze(publicData);
    }

    get dataReference(): UserReference {
        const { id, username, publicKey } = this._data;
        return Object.freeze({ id, username, publicKey });
    }

    get privateData(): PrivateUser {
        return this._data;
    }

    send(cb: (protocol: ClientCommunication) => void) {
        const sockets = websocketManager.getUserSockets(this._data.id);
        for (const socket of sockets) {
            cb(socket.data.protocol);
        }
    }
}