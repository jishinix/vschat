import { UserReference } from "./User";
import { EncryptedContent } from './EncryptedContent'

type createRemoveAttributes = 'id' | 'timestamp' | 'sender';

export interface MessageData {
    id: string,
    chatId: string
    timestamp: number,
    sender: UserReference,
    encryptedContent: EncryptedContent
}

export interface DecrypredMessageData extends Omit<MessageData, 'encryptedContent'> {
    content: string
}

export type MessageCreateData = Omit<MessageData, createRemoveAttributes>
export type DecrypredMessageCreateData = Omit<DecrypredMessageData, createRemoveAttributes>