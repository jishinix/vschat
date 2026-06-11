import { ChangeDetectorRef, Inject, Injectable, signal, WritableSignal } from "@angular/core";
import { PublicUser, UserReference } from "@vschat/shared/interfaces/User";
import { ExtensionBackendCommunication } from "./ExtensionApi/ExtensionBackendCommunication";
import { lookuptypes } from "@vschat/shared/interfaces/RelationLookuptypes";

@Injectable({
    providedIn: 'root'
})
export class AccountStorage {
    public lookups: Record<lookuptypes, WritableSignal<PublicUser[]>> = {
        friends: signal([]),
        blockedUsers: signal([]),
        blockedBy: signal([]),
        friendRequestedUsers: signal([]),
        friendRequestedBy: signal([])
    };

    constructor(private ebc: ExtensionBackendCommunication) {
        this.ebc.user.getRelationLookup('friendRequestedBy').then(async lookup => {
            await this.addRelationship('friendRequestedBy', lookup.lookup)
        })
        this.ebc.user.getRelationLookup('friendRequestedUsers').then(async lookup => {
            await this.addRelationship('friendRequestedUsers', lookup.lookup)
        })
        this.ebc.user.getRelationLookup('friends').then(async lookup => {
            await this.addRelationship('friends', lookup.lookup)
        })
    }

    async addRelationship(lookuptype: lookuptypes, lookup: string[]) {
        if (lookup.length) this.lookups[lookuptype].set(Object.values((await this.ebc.user.getUsers(lookup)).user));
        else this.lookups[lookuptype].set([]);
    }
}