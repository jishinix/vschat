import { database } from "../DbService";
import { User } from "../../models/User";
import { PrivateUser, Relationship, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { AutosaveObserver } from "../../Utils/AutosaveObserver";
import { Cache } from "@vschat/shared/Utils/Cache";


export type userId = string;

class UserLoader extends Cache<PrivateUser, User, ['username']> {
    constructor() {
        super(['username']);
    }

    protected async loadData(keys: Set<string>): Promise<Map<string, PrivateUser | null>> {
        return await this.loadDataBy('id', keys);
    }

    protected async loadDataByAlias(pointerKey: 'username', alias: Set<string>): Promise<Map<string, PrivateUser | null>> {
        return await this.loadDataBy(pointerKey, alias);
    }

    private async loadDataBy(pointerKey: 'username' | 'id', keys: Set<string>): Promise<Map<string, PrivateUser>> {
        const sqlColumn = pointerKey === 'id' ? 'Id' : 'Username';
        const rtn = new Map<string, PrivateUser>();
        const users = await database('Users')
            .select('*')
            .whereIn(`Users.${sqlColumn}`, Array.from(keys));
        if (users.length === 0) return new Map();

        const userIds = users.map(u => u.Id);

        const backups = (
            await database('BackupSlots')
                .select('UserId', 'EncryptedData as Backupslot')
                .whereIn('UserId', userIds))
            .reduce((acc: Map<string, string[]>, curr) => {
                let userCache = acc.get(curr.UserId);
                if (!userCache) userCache = [];
                userCache.push(curr.Backupslot)
                acc.set(curr.UserId, userCache)
                return acc;
            }, new Map());

        const relations = (
            await database('Relationships')
                .select('Id', 'UserId', 'RelatedUserId', 'Status')
                .whereIn('UserId', userIds)
                .orWhereIn('RelatedUserId', userIds))
            .reduce((acc: Map<string, Relationship[]>, curr) => {
                const relation = {
                    id: curr.Id,
                    userId: curr.UserId,
                    relatedUserId: curr.RelatedUserId,
                    status: curr.Status
                };

                if (userIds.includes(curr.UserId)) {
                    let userCache = acc.get(curr.UserId);
                    if (!userCache) userCache = [];
                    userCache.push(relation)
                    acc.set(curr.UserId, userCache)
                }

                // friendship ist nur gespiegelt daher existiert schon ein eintrag für userId -> friendship- Die umgekeerte variante zu laden wäre lediglich eine dopplung. man muss nur wissenw enn man geblockt wurde oder friendshops angefragt oder ignoriert wurden.
                if (userIds.includes(curr.RelatedUserId) && ![RelationshipStatus.friendship].includes(relation.status)) {
                    let relatedUserCache = acc.get(curr.RelatedUserId);
                    if (!relatedUserCache) relatedUserCache = [];
                    relatedUserCache.push(relation)
                    acc.set(curr.RelatedUserId, relatedUserCache)
                }
                return acc;
            }, new Map());

        for (const row of users) {
            rtn.set(row.Id, {
                id: row.Id,
                username: row.Username,
                hashedPassword: row.HashedPassword,
                masterKeyProof: row.MasterKeyProof,
                publicKey: row.PublicKey,
                encryptedPrivateKey: row.EncryptedPrivateKey,
                encryptedMainSlot: row.EncryptedMainSlot,
                encryptedBackupSlots: backups.get(row.Id) || [],
                relations: relations.get(row.Id) || [],
            });
        }
        return rtn;
    }

    protected async saveData(data: Map<string, PrivateUser>) {
        console.log(data);
        const userArray = Array.from(data.values());
        const userEntries = userArray.map(e => {
            return {
                Id: e.id,
                Username: e.username,
                HashedPassword: e.hashedPassword,
                MasterKeyProof: e.masterKeyProof,
                PublicKey: e.publicKey,
                EncryptedPrivateKey: e.encryptedPrivateKey,
                EncryptedMainSlot: e.encryptedMainSlot,
            }
        });

        const backupslots: { UserId: string, EncryptedData: string }[] = []
        userArray.map(e => {
            e.encryptedBackupSlots.forEach(bs => backupslots.push({
                UserId: e.id,
                EncryptedData: bs
            }))
        })

        await database.transaction(async (trx) => {
            await trx('Users').insert(userEntries).onConflict(['Id']).merge();

            if (backupslots.length > 0) {
                const userIds = userArray.map(u => u.id);
                await trx('BackupSlots').whereIn('UserId', userIds).delete();
                await trx('BackupSlots').insert(backupslots);
            }
        });
    }

    protected async processData(rawData: PrivateUser): Promise<User> {
        return new User(rawData)
    }

}

export const userLoader = new UserLoader();