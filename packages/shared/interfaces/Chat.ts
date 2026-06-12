import { MessageData } from "./Messages";
import { UserReference } from "./User";


export type ChatList = ChatListItem[]

export enum chatTypes {
    direct,
    group
}

interface ChatBase {
    id: string,
    type: chatTypes,
    name?: string,
    participants: UserReference[],
}

export interface ChatListItem extends ChatBase {
    lastMsg: MessageData
}

export interface ChatData extends ChatBase { }