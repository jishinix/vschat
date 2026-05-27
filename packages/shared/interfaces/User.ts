
export type userId = string;
export interface UserReference {
    id: string,
    username: string,
    publicKey: string
}

export enum RelationshipStatus {
    friendshipRequested = 'fr',
    friendshipRequestIgnored = 'fri',
    friendship = 'f',
    blocked = 'b',
}

export interface Relationship {
    id: number,
    userId: string,
    relatedUserId: string,
    status: RelationshipStatus
}

export interface PublicUser extends UserReference {

}

export interface PrivateUser extends PublicUser {
    hashedPassword: string;
    masterKeyProof: string;
    encryptedPrivateKey: string;
    encryptedMainSlot: string;
    encryptedBackupSlots: string[];
    relations: Relationship[];
}