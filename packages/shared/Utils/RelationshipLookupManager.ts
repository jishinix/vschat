import { lookuptypes } from '../interfaces/RelationLookuptypes'
import { Relationship, RelationshipStatus } from '../interfaces/User'

export class RelationshipLookupManager {
    private readonly lookups: Record<lookuptypes, Map<string, Relationship>> = {
        friends: new Map<string, Relationship>(),
        blockedUsers: new Map<string, Relationship>(),     // ich habe blockiert
        blockedBy: new Map<string, Relationship>(),        // wurde von jemandem blockiert
        friendRequestedUsers: new Map<string, Relationship>(),
        friendRequestedBy: new Map<string, Relationship>(),
    }

    constructor(private userId: string, relations: Relationship[], private sendLookupCb: ((i: lookuptypes, v: string[]) => void) | null) {
        for (const rel of relations) {
            this.interpretRelationship(rel);
        }
    }

    private preClearOldRelation(rel: Relationship) {
        for (const [index, val] of Object.entries(this.lookups)) {
            const sendNew = val.has(rel.userId) || val.has(rel.relatedUserId);
            val.delete(rel.userId);
            val.delete(rel.relatedUserId);
            if (sendNew && this.sendLookupCb) this.sendLookupCb(index as lookuptypes, Array.from(this.lookups[index as lookuptypes].keys()));
        }
    }

    interpretRelationship(rel: Relationship, isInit: boolean = true) {
        if (!isInit) this.preClearOldRelation(rel);

        switch (rel.status) {
            case RelationshipStatus.friendship:
                if (rel.relatedUserId != this.userId) {
                    this.lookups.friends.set(rel.relatedUserId, rel);
                    if (!isInit && this.sendLookupCb) this.sendLookupCb('friends', Array.from(this.lookups.friends.keys()))
                }
                break;

            case RelationshipStatus.blocked:
                if (rel.userId === this.userId) {
                    this.lookups.blockedUsers.set(rel.relatedUserId, rel);
                    if (!isInit && this.sendLookupCb) this.sendLookupCb('blockedUsers', Array.from(this.lookups.blockedUsers.keys()))
                } else {
                    this.lookups.blockedBy.set(rel.userId, rel);
                    if (!isInit && this.sendLookupCb) this.sendLookupCb('blockedBy', Array.from(this.lookups.blockedBy.keys()))
                }
                break;

            case RelationshipStatus.friendshipRequested:
                if (rel.userId === this.userId) {
                    this.lookups.friendRequestedUsers.set(rel.relatedUserId, rel);
                    if (!isInit && this.sendLookupCb) this.sendLookupCb('friendRequestedUsers', Array.from(this.lookups.friendRequestedUsers.keys()))
                } else {
                    this.lookups.friendRequestedBy.set(rel.userId, rel);
                    if (!isInit && this.sendLookupCb) this.sendLookupCb('friendRequestedBy', Array.from(this.lookups.friendRequestedBy.keys()))
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