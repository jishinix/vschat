import { PrivateUser as IPrivateUser, PublicUser as IPublicUser, PrivateWebviewUser, Relationship, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { serverCommunication } from '../services/ServerWebsocketApi/ServerCommunication';
import { PublicUser } from './PublicUser';
import { userLoader } from '../services/Loader/UserLoader';
import { WebviewCommunication } from '../services/WebviewApi/WebviewCommunication';
import { RelationshipLookupManager } from '@vschat/shared/Utils/RelationshipLookupManager'
import { lookuptypes } from '@vschat/shared/interfaces/RelationLookuptypes';

export class PrivateUser extends PublicUser<IPrivateUser> {
    private relationships: RelationshipLookupManager;

    constructor(_data: IPrivateUser) {
        super(_data);
        this.relationships = new RelationshipLookupManager(_data.id, _data.relations, WebviewCommunication.getInstance().user.updateRelationLookup)
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