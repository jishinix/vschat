import { database } from "./DbService";
import { User } from "../models/User";
import { AutosaveObserver } from "../Utils/AutosaveObserver";
import { Cache } from "@vschat/shared/Utils/Cache";

export interface RawUserData {
    id: string;
    username: string;
    hashedPassword: string;
    masterKeyProof: string;
    publicKey: string;
    encryptedPrivateKey: string;
    encryptedMainSlot: string;
    encryptedBackupSlots: string[];
}

class UserLoader extends Cache<User, ['username']> {
    constructor() {
        super(['username']);
    }

    protected async loadData(keys: Set<string>): Promise<Map<string, User | null>> {
        return await this.loadDataBy('id', keys);
    }

    protected async loadDataByAlias(pointerKey: 'username', alias: Set<string>): Promise<Map<string, User | null>> {
        return await this.loadDataBy(pointerKey, alias);
    }

    private async loadDataBy(pointerKey: 'username' | 'id', keys: Set<string>) {
        const sqlColumn = pointerKey === 'id' ? 'Id' : 'Username';
        const rtn = new Map<string, User | null>();
        const query = database('Users')
            .select('Users.*', 'BackupSlots.EncryptedData as Backupslot')
            .leftJoin('BackupSlots', 'Users.Id', '=', 'BackupSlots.UserId')
            .whereIn(`Users.${sqlColumn}`, Array.from(keys));

        const rows = await query;
        for (const row of rows) {
            let user = rtn.get(row.Id);
            if (!user) {
                user = new User({
                    id: row.Id,
                    username: row.Username,
                    hashedPassword: row.HashedPassword,
                    masterKeyProof: row.MasterKeyProof,
                    publicKey: row.PublicKey,
                    encryptedPrivateKey: row.EncryptedPrivateKey,
                    encryptedMainSlot: row.EncryptedMainSlot,
                    encryptedBackupSlots: []
                })
            }
            if (row.Backupslot) {
                user.data.encryptedBackupSlots.push(row.Backupslot);
            }
            rtn.set(row.Id, user);
        }
        return rtn;
    }

    protected async saveData(data: Map<string, User>) {
        const userArray = Array.from(data.values());
        const userEntries = userArray.map(e => {
            return {
                Id: e.data.id,
                Username: e.data.username,
                HashedPassword: e.data.hashedPassword,
                MasterKeyProof: e.data.masterKeyProof,
                PublicKey: e.data.publicKey,
                EncryptedPrivateKey: e.data.encryptedPrivateKey,
                EncryptedMainSlot: e.data.encryptedMainSlot,
            }
        });

        const backupslots: { UserId: string, EncryptedData: string }[] = []
        userArray.map(e => {
            e.data.encryptedBackupSlots.forEach(bs => backupslots.push({
                UserId: e.data.id,
                EncryptedData: bs
            }))
        })

        await database.transaction(async (trx) => {
            await trx('Users').insert(userEntries).onConflict(['Id']).merge();

            if (backupslots.length > 0) {
                const userIds = userArray.map(u => u.data.id);
                await trx('BackupSlots').whereIn('UserId', userIds).delete();
                await trx('BackupSlots').insert(backupslots);
            }
        });
    }

}

export const userLoader = new UserLoader();