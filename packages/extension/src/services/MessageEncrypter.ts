import { Attachment, DecrypredMessageCreateData, MessageCreateData } from "@vschat/shared/interfaces/Messages";
import { Chat } from "@vschat/shared/models/Chat";
import { CryptoService } from "@vschat/shared/Utils/CryptoService";
import { generate } from "short-uuid";
import { serverCommunication } from "./ServerWebsocketApi/ServerCommunication";
import { UserReference } from "@vschat/shared/interfaces/User";


class MessageEncrypter {
    private attachmentIdMap = new Map<string, string>()


    async prepareMessage(chat: Chat, mcd: DecrypredMessageCreateData): Promise<MessageCreateData> {
        const chatSessionKey = CryptoService.generateKeyFromContent(await serverCommunication.authHander.getChatSession() + chat.data.id);
        const participants = Object.fromEntries(chat.data.participants.map(e => [e.id, e]))
        const { content, ...filteredMcd } = mcd;
        return {
            ...filteredMcd,
            encryptedContent: await this.prepareMessageContent(participants, mcd, chatSessionKey),
            attachments: this.prepareAttachments(participants, mcd, chatSessionKey)
        }
    }

    private async prepareMessageContent(participants: Record<string, UserReference>, mcd: DecrypredMessageCreateData, chatSessionKey: string) {
        return CryptoService.createEncryptedContent(mcd.content, participants, chatSessionKey)
    }

    private prepareAttachments(participants: Record<string, UserReference>, mcd: DecrypredMessageCreateData, chatSessionKey: string): Attachment[] {
        const attachments: Attachment[] = [];
        if (mcd.attachments?.length) {
            return mcd.attachments.map(e => {
                const encryptedContent = CryptoService.createEncryptedContent(e.data, participants, chatSessionKey)
                const id = generate();
                this.attachmentIdMap.set(id, encryptedContent.encryptedContent)
                setTimeout(() => {
                    this.attachmentIdMap.delete(id)
                }, 1000 * 60 * 5)
                return {
                    ...e,
                    id,
                    decryptCollection: {
                        fingerPrint: encryptedContent.fingerPrint,
                        keys: encryptedContent.keys
                    }
                }
            })
        }
        return attachments;
    }

    async uploadAttachments(attachments: Record<string, string>) {
        const promises: Promise<Response>[] = []
        Object.entries(attachments).forEach(e => {
            const attachmentId = e[0];
            const uploadUrl = e[1];
            const encryptedData = this.attachmentIdMap.get(attachmentId);
            this.attachmentIdMap.delete(attachmentId);

            if (encryptedData) {
                const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
                promises.push(fetch(uploadUrl, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': 'application/octet-stream',
                    },
                }))
            } else {
                throw new Error('Extensionbackend does not have Encrypted data')
            }
        })
        const responses = await Promise.all(promises);
        for (const res of responses) {
            if (res.status !== 200) {
                const errorBody = await res.text();
                console.error('S3 Upload Error:', errorBody);
            }
        }
        if (responses.some(e => e.status !== 200)) throw new Error('Beim hochladen ist ein fehler aufgetreten')
        return true;
    }
}

export const messageEncrypter = new MessageEncrypter()