import { UserReference } from "./User";
import { EncryptedContent, DecryptionCollection } from './EncryptedContent'

type createRemoveAttributes = 'id' | 'timestamp' | 'sender' | 'attachments';

export interface MessageData {
    id: string,
    chatId: string
    timestamp: number,
    sender: UserReference,
    encryptedContent: EncryptedContent,
    attachments: Attachment[]
}

export interface DecrypredMessageData extends Omit<MessageData, 'encryptedContent'> {
    content: string
}

export type MessageCreateData = Omit<MessageData, createRemoveAttributes> & {
    attachments?: Attachment[]
}
export type DecrypredMessageCreateData = Omit<DecrypredMessageData, createRemoveAttributes> & {
    attachments?: RawAttachment[]
}

export interface Attachment {
    id: string,
    mineType: string,
    fileName: string,
    decryptCollection: DecryptionCollection
}

export type RawAttachment = Omit<Attachment, 'id' | 'decryptCollection'> & {
    data: string
}