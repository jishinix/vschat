import { UserReference } from "./User";
import { EncryptedContent, DecryptionCollection } from './EncryptedContent'

type createRemoveAttributes = 'id' | 'timestamp' | 'sender';

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

export type MessageCreateData = Omit<MessageData, createRemoveAttributes>
export type DecrypredMessageCreateData = Omit<DecrypredMessageData, createRemoveAttributes>

export interface Attachment {
    id: string,
    mineType: string,
    fileName: string,
    decryptCollection: DecryptionCollection
}