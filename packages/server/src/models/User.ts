import { PrivateUser, PublicUser } from '@vschat/shared/interfaces/User'


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

    get privateData(): PrivateUser {
        return this._data;
    }
}