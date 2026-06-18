import { DecrypredMessageData, MessageData } from "@vschat/shared/interfaces/Messages";
import { Cache } from "@vschat/shared/Utils/Cache";
import { timeStamp } from "node:console";
import { userLoader } from "./UserLoader";
import { PrivateUser } from "@vschat/shared/interfaces/User";
import { ChatData } from "@vschat/shared/interfaces/Chat";
import { Message } from '@vschat/shared/models/Message'
import { chatLoader } from "./ChatLoader";
import { serverCommunication } from "../ServerWebsocketApi/ServerCommunication";
import { authService } from "../auth/AuthService";
import { CryptoService } from '@vschat/shared/Utils/CryptoService'
import { Worker } from "node:worker_threads";
import { ExtensionState } from "../ExtensionState";
import path from 'path';
import fs from 'fs';
import { EncryptedContent } from "@vschat/shared/interfaces/EncryptedContent";


type MessageType = Message<DecrypredMessageData, typeof chatLoader, typeof userLoader>

export class MessagesLoader extends Cache<DecrypredMessageData, MessageType> {
    constructor(private chatId: string) {
        super([]);
    }

    protected async loadData(key: Set<string>): Promise<Map<string, DecrypredMessageData>> {
        const messages = await serverCommunication.chatHandler.getMessages(this.chatId, Array.from(key))



        const startTime = new Date().getTime()
        const aMsgs = Array.from(Object.entries(messages.messages));
        const contents = await this.encryptMultibleMessageContents(aMsgs.map(e => e[1].encryptedContent));
        const decryptedMessage: [string, DecrypredMessageData][] = aMsgs.map((e, i) => ([e[0], { ...e[1], content: contents[i] }]));

        console.log('ENTCRYPTIONTIME', new Date().getTime() - startTime)


        return new Map<string, DecrypredMessageData>(decryptedMessage);
    }


    private async encryptMultibleMessageContents(encryptedContents: EncryptedContent[]) {
        if (encryptedContents.length < 500) {
            return CryptoService.decryptMultibleContent(encryptedContents, authService.privateKey || '', serverCommunication.userHandler.logedInUser?.data.id || '') as string[];
        } else {
            const worker = new Worker(path.join(ExtensionState.getContext().extensionPath, 'worker', 'EncryptMessages.js'));
            const contents = await new Promise((res, rej) => {
                worker.on('error', (err) => {
                    console.error('FEHLER IM WORKER:', err);
                    rej()
                });

                worker.on('message', (data) => {
                    console.log('NACHRICHT VOM WORKER EMPFANGEN:', data);
                    res(data);
                });

                console.log('[Haupt-Thread] Schicke Daten an den Worker...');
                worker.postMessage({
                    messages: encryptedContents,
                    userId: serverCommunication.userHandler.logedInUser?.data.id || '',
                    privateKey: authService.privateKey || ''
                });
            }) as string[];
            worker.terminate();
            return contents;
        }
    }

    protected async getProcessedData(rawData: DecrypredMessageData): Promise<MessageType> {
        return new Message(rawData, chatLoader, userLoader);
    }

    async fetch(max: number = 50, lastMessageId: string | null = null) {
        const messageIds = await serverCommunication.chatHandler.fetchMessageIds(this.chatId, max, lastMessageId);

        const messages = await this.getData(messageIds.messageIds)
        return Array.from(await messages.values())
            .filter(e => !!e)
            .sort((a: MessageType, b: MessageType) => {
                return a!.data.timestamp - b!.data.timestamp
            })
    }

    async cacheMessage(msg: MessageData) {
        const user = await serverCommunication.userHandler.getLogedInUser();
        console.log('HIER', msg.encryptedContent, user, authService.privateKey);
        if (!user || !authService.privateKey) return false;
        const content = CryptoService.decryptContent(msg.encryptedContent, user.data.id, authService.privateKey);
        if (!content) return false;
        const map = new Map<string, DecrypredMessageData>();
        map.set(msg.id, { ...msg, content: content?.content })
        this.cacheData(map);
        return true;
    }
}