import { PrivateUser as IPrivateUser, PublicUser as IPublicUser, Relationship, RelationshipStatus } from '@vschat/shared/interfaces/User'
import { Cache } from "@vschat/shared/Utils/Cache";
import { PublicUser } from '../models/PublicUser';
import { serverCommunication } from './ServerWebsocketApi/ServerCommunication';


export type userId = string;

class UserLoader extends Cache<IPublicUser, PublicUser> {

    constructor() {
        super([], true);
    }

    protected async loadData(keys: Set<string>): Promise<Map<string, IPublicUser | null>> {
        const users = serverCommunication.userHandler.getUsers(Array.from(keys));
        return new Map<string, IPublicUser>(Object.entries(users));;
    }

    protected async processData(rawData: IPublicUser): Promise<PublicUser> {
        return new PublicUser(rawData)
    }

}

export const userLoader = new UserLoader();