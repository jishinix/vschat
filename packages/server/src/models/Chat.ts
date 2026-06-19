import { Attachment, MessageCreateData, MessageData } from "@vschat/shared/interfaces/Messages";
import { UserReference } from "@vschat/shared/interfaces/User";
import { Chat } from "@vschat/shared/models/Chat";
import { generate } from "short-uuid";
import { MessagesLoader } from "../services/Loader/MessagesLoader";
import { userLoader } from "../services/Loader/UserLoader";
import { protocol } from "electron";
import { chatLoader } from "../services/Loader/ChatLoader";
import { socketWithDataType, websocketManager } from "../services/WebsocketManager";
import { ClientCommunication } from "../services/ClientApi/ClientCommunication";
import { mediaManager } from "../services/MediaManager";


export class ServerChat extends Chat<MessagesLoader, typeof userLoader> {

    async addMessage(mcd: MessageCreateData, socket: socketWithDataType) {
        const user = await socket.data.getUser();
        if (!user || !this.checkUserIsAuthorized(user.data.id)) throw new Error('Nutzer ist nicht authorisiert');

        const msg: MessageData = {
            ...mcd,
            timestamp: new Date().getTime(),
            id: generate(),
            sender: user.data,
            attachments: []
        }

        if (mcd.attachments?.length) {
            const attachments = await this.fetchAttachment(mcd, socket);
            msg.attachments = attachments;
        }


        await this.messageLoader.addData(msg.id, msg);
        for (const [, participant] of await this.getParticipants()) {
            if (participant)
                participant.send(async protocol => {
                    await protocol.chatHandler.sendMsg(msg)
                })
        }

        await this.markChatAsReaded(msg.sender.id);
    }

    async markChatAsReaded(userId: string) {
        if (!this.checkUserIsAuthorized(userId)) return;
        const messageId = await chatLoader.markChatAsReadPersistent(userId, this.data.id);

        const user = await (await userLoader.getData([userId])).get(userId);
        if (!user) return;
        user.send((protocol) => {
            protocol.chatHandler.markChatAsReaded(this.data.id, messageId)
        })
    }

    async fetchAttachment(mcd: MessageCreateData, socket: socketWithDataType): Promise<Attachment[]> {
        if (!mcd.attachments) return [];

        const attachmentIdUrlMap: Record<string, string> = {};
        const messageAttachments: Attachment[] = []
        const promises = mcd.attachments.map(async e => {
            const realId = generate();
            messageAttachments.push({ ...e, id: realId });
            const uploadUrl = await mediaManager.generateUploadUrl(realId)
            attachmentIdUrlMap[e.id] = uploadUrl;
        })
        await Promise.all(promises);
        const uploaded = await socket.data.protocol.chatHandler.request('uploadAttachmentsRequest', { attachmentIdUrlMap })
        if (!uploaded?.uploaded) throw new Error('Einige Attachments wurden nciht korrekt hochgeladen');
        const existence = await Promise.all(messageAttachments.map(e => mediaManager.exists(e.id)));
        if (existence.includes(false)) throw new Error("Einige Attachments wurden nicht korrekt hochgeladen");
        return messageAttachments
    }
}