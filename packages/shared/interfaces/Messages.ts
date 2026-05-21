import { UserReference } from "./User";


export interface Message {
    chatId: string
    timestamp: number,
    sender: UserReference,
    encryptedContent: string
    content?: string
}