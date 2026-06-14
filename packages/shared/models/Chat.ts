

import { ChatData } from '../interfaces/Chat'
import { UserReference } from '../interfaces/User';
import { Cache } from '../Utils/Cache'


export class Chat<
    MessageLoader extends Cache<any, any> = Cache<any, any>,
    UserLoader extends Cache<any, any> = Cache<any, any>
> {
    public messageLoader: MessageLoader;
    constructor(private _data: ChatData<UserReference>, messageLoader: new (chatId: string) => MessageLoader, private userLoader: UserLoader) {
        this.messageLoader = new messageLoader(this._data.id);
    }

    get data() {
        return this._data;
    }

    async getParticipants(): Promise<ReturnType<UserLoader['getData']>> {
        const participants = await this.userLoader.getData(this.data.participants.map(e => e.id));
        return participants;
    }

    async getMessages(messagIds: string[]) {
        return await this.messageLoader.getData(messagIds);
    }

    checkUserIsAuthorized(userId: string) {
        return this.data.participants.some(e => e.id == userId)
    }

}