import { PrivateUser as IPrivateUser, PublicUser as IPublicUser, PrivateWebviewUser, Relationship, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { serverCommunication } from '../services/ServerWebsocketApi/ServerCommunication';
import { PublicUser } from './PublicUser';
import { userLoader } from '../services/Loader/UserLoader';
import { WebviewCommunication } from '../services/WebviewApi/WebviewCommunication';
import { lookuptypes } from '@vschat/shared/interfaces/RelationLookuptypes'

class RelationshipStorage {
    private readonly lookups: Record<lookuptypes, Map<string, Relationship>> = {
        friends: new Map<string, Relationship>(),
        blockedUsers: new Map<string, Relationship>(),     // ich habe blockiert
        blockedBy: new Map<string, Relationship>(),        // wurde von jemandem blockiert
        friendRequestedUsers: new Map<string, Relationship>(),
        friendRequestedBy: new Map<string, Relationship>(),
    }

    constructor(private userId: string, relations: Relationship[]) {
        for (const rel of relations) {
            this.interpretRelationship(rel);
        }
    }

    private preClearOldRelation(rel: Relationship) {
        for (const [index, val] of Object.entries(this.lookups)) {
            const sendNew = val.has(rel.userId) || val.has(rel.relatedUserId);
            val.delete(rel.userId);
            val.delete(rel.relatedUserId);
            if (sendNew) WebviewCommunication.getInstance().user.updateRelationLookup(index as lookuptypes, Array.from(this.lookups[index as lookuptypes].keys()))
        }
    }

    interpretRelationship(rel: Relationship, isInit: boolean = true) {
        if (!isInit) this.preClearOldRelation(rel);

        switch (rel.status) {
            case RelationshipStatus.friendship:
                if (rel.relatedUserId != this.userId) {
                    this.lookups.friends.set(rel.relatedUserId, rel);
                    if (!isInit) WebviewCommunication.getInstance().user.updateRelationLookup('friends', Array.from(this.lookups.friends.keys()))
                }
                break;

            case RelationshipStatus.blocked:
                if (rel.userId === this.userId) {
                    this.lookups.blockedUsers.set(rel.relatedUserId, rel);
                    if (!isInit) WebviewCommunication.getInstance().user.updateRelationLookup('blockedUsers', Array.from(this.lookups.blockedUsers.keys()))
                } else {
                    this.lookups.blockedBy.set(rel.userId, rel);
                    if (!isInit) WebviewCommunication.getInstance().user.updateRelationLookup('blockedBy', Array.from(this.lookups.blockedBy.keys()))
                }
                break;

            case RelationshipStatus.friendshipRequested:
                if (rel.userId === this.userId) {
                    this.lookups.friendRequestedUsers.set(rel.relatedUserId, rel);
                    if (!isInit) WebviewCommunication.getInstance().user.updateRelationLookup('friendRequestedUsers', Array.from(this.lookups.friendRequestedUsers.keys()))
                } else {
                    this.lookups.friendRequestedBy.set(rel.userId, rel);
                    if (!isInit) WebviewCommunication.getInstance().user.updateRelationLookup('friendRequestedBy', Array.from(this.lookups.friendRequestedBy.keys()))
                }
                break;
        }
    }

    isFriend(userId: string): boolean {
        return this.lookups.friends.has(userId);
    }

    isBlockedBy(userId: string): boolean {
        return this.lookups.blockedBy.has(userId);
    }

    hasBlocked(userId: string): boolean {
        return this.lookups.blockedUsers.has(userId);
    }

    hasPendingFriendRequest(userId: string): boolean {
        return this.lookups.friendRequestedUsers.has(userId);
    }

    getLookup(lookuptype: lookuptypes) {
        return Array.from(this.lookups[lookuptype].keys());
    }
}

export class PrivateUser extends PublicUser<IPrivateUser> {
    private relationships: RelationshipStorage;

    constructor(_data: IPrivateUser) {
        super(_data);
        this.relationships = new RelationshipStorage(_data.id, _data.relations)
    }

    get data(): Readonly<Omit<IPrivateUser, 'relations'>> {
        const { relations, ...publicData } = this._data;
        return Object.freeze(publicData);
    }

    get webviewData(): Readonly<PrivateWebviewUser> {
        const { hashedPassword, masterKeyProof, encryptedPrivateKey, encryptedMainSlot, encryptedBackupSlots, ...webviewData } = this._data;
        return Object.freeze(webviewData);
    }

    // Delegation
    isFriend(userId: string) { return this.relationships.isFriend(userId); }
    isBlockedBy(userId: string) { return this.relationships.isBlockedBy(userId); }
    hasBlocked(userId: string) { return this.relationships.hasBlocked(userId); }
    hasPendingFriendRequest(userId: string) { return this.relationships.hasPendingFriendRequest(userId); }

    addRelationship(rel: Relationship) { this.relationships.interpretRelationship(rel, false) }
    getRelationLookup(lookuptype: lookuptypes) { return this.relationships.getLookup(lookuptype) }


    async getFriendUsers() {
        const friendIds = this.relationships.getLookup('friends');
        const user = userLoader.getData(friendIds);
        return user;
    }
}