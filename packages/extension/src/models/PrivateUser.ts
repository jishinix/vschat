import { PrivateUser as IPrivateUser, PublicUser as IPublicUser, PrivateWebviewUser, Relationship, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { serverCommunication } from '../services/ServerWebsocketApi/ServerCommunication';
import { PublicUser } from './PublicUser';
import { userLoader } from '../services/UserLoader';

class RelationshipStorage {
    private readonly friends = new Set<string>();
    private readonly blockedUsers = new Set<string>();     // ich habe blockiert
    private readonly blockedBy = new Set<string>();        // wurde von jemandem blockiert
    private readonly friendRequestedUsers = new Set<string>();
    private readonly friendRequestedBy = new Set<string>();

    constructor(userId: string, relations: Relationship[]) {
        for (const rel of relations) {
            switch (rel.status) {
                case RelationshipStatus.friendship:
                    this.friends.add(rel.relatedUserId);
                    break;

                case RelationshipStatus.blocked:
                    if (rel.userId === userId) {
                        this.blockedUsers.add(rel.relatedUserId);
                    } else {
                        this.blockedBy.add(rel.userId);
                    }
                    break;

                case RelationshipStatus.friendshipRequested:
                    if (rel.userId === userId) {
                        this.friendRequestedUsers.add(rel.relatedUserId);
                    } else {
                        this.friendRequestedBy.add(rel.userId);
                    }
                    break;
            }
        }
    }

    isFriend(userId: string): boolean {
        return this.friends.has(userId);
    }

    isBlockedBy(userId: string): boolean {
        return this.blockedBy.has(userId);
    }

    hasBlocked(userId: string): boolean {
        return this.blockedUsers.has(userId);
    }

    hasPendingFriendRequest(userId: string): boolean {
        return this.friendRequestedUsers.has(userId);
    }

    getFriends(): string[] {
        return Array.from(this.friends);
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
    getFriends() { return this.relationships.getFriends(); }
    isFriend(userId: string) { return this.relationships.isFriend(userId); }
    isBlockedBy(userId: string) { return this.relationships.isBlockedBy(userId); }
    hasBlocked(userId: string) { return this.relationships.hasBlocked(userId); }
    hasPendingFriendRequest(userId: string) { return this.relationships.hasPendingFriendRequest(userId); }


    async getFriendUsers() {
        const friendIds = this.getFriends();
        const user = userLoader.getData(friendIds);
        return user;
    }
}