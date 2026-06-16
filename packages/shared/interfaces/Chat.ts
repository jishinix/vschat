import { MessageData } from "./Messages";
import { UserReference } from "./User";


export type ChatList = ChatListItem<UserReference>[]

export enum chatTypes {
    direct,
    group
}

interface _ChatBase<participantsType> {
    id: string,
    type: chatTypes,
    name?: string,
    participants: participantsType[],
}

interface ChatBaseDirect<participantsType> extends _ChatBase<participantsType> {
    type: chatTypes.direct,
    participants: [participantsType, participantsType]
}

interface ChatBaseGroup<participantsType> extends Omit<_ChatBase<participantsType>, 'type'> {
    type: chatTypes.group,
    name: string, // Bei Gruppen-Chats ist der Name meistens Pflicht
    participants: participantsType[]
}

export type ChatBase<participantsType> = ChatBaseDirect<participantsType> | ChatBaseGroup<participantsType>;


export type ChatListItem<participantsType> = ChatBase<participantsType> & {
    unreadedMsgs: number;
    lastMsgTimestamp: number;
    lastReadedMessageId: string
};

export type ChatData<participantsType> = ChatBase<participantsType>

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type ChatCreateData<participantsType> = DistributiveOmit<ChatData<participantsType>, 'id'>;

export interface RawChatListInfos { unreadedMessages: number, lastMsgTimestamp: number, lastReadedMessageId: string }