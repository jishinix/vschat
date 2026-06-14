import { DecrypredMessageData, MessageData } from '../interfaces/Messages'
import { Cache } from '../Utils/Cache'

export class Message<
    MessageDataType extends MessageData | DecrypredMessageData = MessageData | DecrypredMessageData,
    ChatLoader extends Cache<any, any> = Cache<any, any>,
    UserLoader extends Cache<any, any> = Cache<any, any>
> {
    constructor(private _data: MessageDataType, private chatLoader: ChatLoader, private userLoader: UserLoader) {

    }

    get data() {
        return this._data;
    }

    async getSender() {
        const author = await this.userLoader.getData([this.data.sender.id]);
        return author.get(this.data.sender.id);
    }

    async getChat() {
        const chat = await this.chatLoader.getData([this.data.chatId]);
        return chat.get(this.data.chatId);
    }

}