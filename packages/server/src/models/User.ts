import { PrivateUser, PublicUser, Relationship as iRelationship, UserReference, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { socketWithDataType, websocketManager } from '../services/WebsocketManager';
import { ClientCommunication } from '../services/ClientApi/ClientCommunication';
import { RelationshipLookupManager } from '@vschat/shared/Utils/RelationshipLookupManager'
import { userLoader } from '../services/Loader/UserLoader';
import { Relationship } from './Relationship';
import { database } from '../services/DbService';
import { CryptoService } from '@vschat/shared/Utils/CryptoService';

export class User {
    private _relationManager: RelationshipLookupManager;
    constructor(private _data: PrivateUser) {
        this._relationManager = new RelationshipLookupManager(_data.id, _data.relations, null);
    }

    get relationManager() {
        return this._relationManager as Omit<RelationshipLookupManager, 'interpretRelationship'>;
    }

    static async addRelationsip(relation: Relationship) {
        const usersMap = await userLoader.getData([relation.data.userId, relation.data.relatedUserId]);
        const users = [usersMap.get(relation.data.userId), usersMap.get(relation.data.relatedUserId)].filter(e => !!e);
        if (users.length != 2) return false;
        const cRelation = { data: JSON.parse(JSON.stringify(relation.data)) } as any;
        if (cRelation.data.status === RelationshipStatus.friendshipRequestIgnored) {
            cRelation.data.status = RelationshipStatus.none
        }
        for (const [index, user] of users.entries()) {
            user.send((protocol) => {
                protocol.userHandler.updateRelation(cRelation.data)
            })
            user.addRelationShip(relation.data);
        }
        return true;
    }

    private addRelationShip(relationShip: iRelationship) {

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

    async getSessionKey() {
        const lastTs = new Date().getTime() - 1000 * 60 * 15;
        const existingKey = await database.transaction(async trx => {
            const result = await trx('UserChatSessionKeys')
                .select(['Key'])
                .where('CreatedTimestamp', '>', lastTs)
                .where('UserId', '=', this.data.id)
                .first();
            trx('UserChatSessionKeys')
                .where('CreatedTimestamp', '<=', lastTs);

            return result ? result.Key : null;
        })
        if (existingKey) return existingKey as string;
        const key = CryptoService.generateSecureAESKey()
        await database('UserChatSessionKeys')
            .insert({
                UserId: this.data.id,
                CreatedTimestamp: new Date().getTime(),
                Key: key,
            })
        return key;
    }
}