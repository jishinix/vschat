
export type userId = string;
export interface UserReference {
    id: string,
    username: string,
    publicKey: string
}

export const RelationshipStatus = {
    friendshipRequested: 'fr',
    friendshipRequestIgnored: 'fri',
    friendship: 'f',
    blocked: 'b',
} as const
export type RelationshipStatus = typeof RelationshipStatus[keyof typeof RelationshipStatus];

export const SpecificRelationshipStatus = {
    ...RelationshipStatus,
    gotBlocked: 'gb',
    gotFriendshipRequest: 'gfr'
} as const
export type SpecificRelationshipStatus = typeof SpecificRelationshipStatus[keyof typeof SpecificRelationshipStatus];

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

export type PrivateWebviewUser = Omit<PrivateUser,
    "hashedPassword" |
    "masterKeyProof" |
    "encryptedPrivateKey" |
    "encryptedMainSlot" |
    "encryptedBackupSlots"
>