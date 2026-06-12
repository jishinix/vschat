import { UserReference } from "./User";


export interface MessageData {
    id: string,
    chatId: string
    timestamp: number,
    sender: UserReference,
    encryptedContent: string
    content?: string
}