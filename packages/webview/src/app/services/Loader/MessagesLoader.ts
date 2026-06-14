import { DecrypredMessageData, MessageData } from "@vschat/shared/interfaces/Messages";
import { Cache } from "@vschat/shared/Utils/Cache";
import { PrivateUser } from "@vschat/shared/interfaces/User";
import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Message } from '@vschat/shared/models/Message'
import { ExtensionBackendCommunication } from "../ExtensionApi/ExtensionBackendCommunication";
import { inject, Injector } from "@angular/core";



export class MessagesLoader extends Cache<DecrypredMessageData> {
    private ebc: ExtensionBackendCommunication;
    private injector = inject(Injector);
    constructor(private chatId: string,) {
        super([], true, false, true);
        this.ebc = this.injector.get(ExtensionBackendCommunication);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, DecrypredMessageData>> {
        const messages = await this.ebc.chat.getMessages(this.chatId, Array.from(key))
        return new Map<string, DecrypredMessageData>(Object.entries(messages.messages));
    }

    async fetch(max: 50, lastMessageId: string | null = null) {
        return await this.ebc.chat.fetchMessages(this.chatId, max, lastMessageId);
    }
}