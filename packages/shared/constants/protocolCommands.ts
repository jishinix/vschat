import { Relationship, PublicUser, PrivateUser, PrivateWebviewUser, UserReference } from '../interfaces/User'
import { AuthActionLoginWebViewRtn, AuthActionRegisterWebViewRtn } from '../interfaces/ApiInterfaces'
import { ChatList } from '../interfaces/Chat'
import { UserSendFriendRequestReturn } from '../interfaces/UserActionInterfaces'
import { lookuptypes } from '../interfaces/RelationLookuptypes'
import { MessageData } from '../interfaces/Messages'
import { ChatData } from '../interfaces/Chat'


export const server_client_coreCommands = {
    USER_NOT_FOUND: { name: 'userNotFound', dataType: {}, returnType: {} }
} as const

export const server_client_userCommands = {
    GET_LOGED_IN_USER: { name: 'getLogedInUser', dataType: {}, returnType: { user: {} as PrivateUser | null } },
    GET_RELATIONS: { name: 'getRelations', dataType: {}, returnType: { relations: [] as Relationship[] } },
    GET_USER: { name: 'getUser', dataType: { userId: '' as string }, returnType: { user: {} as PublicUser | null } },
    GET_USERS: { name: 'getUsers', dataType: { userIds: [] as string[] }, returnType: { user: {} as Record<string, PublicUser> } },
    SEND_FRIEND_REQUEST: { name: 'sendFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },
    IGNORE_FRIEND_REQUEST: { name: 'ignoreFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },
    CLIENT_RELATIONUPDATE: { name: 'relationUpdate', dataType: { relation: {} as Relationship }, returnType: {} },
} as const

export const extension_webview_authCommands = {
    RECOVER: { name: 'recover', dataType: { username: "" as string, backupcode: "" as string, newPassword: "" as string }, returnType: {} as any },
    LOGIN: { name: 'login', dataType: { username: "" as string, password: "" as string }, returnType: {} as AuthActionLoginWebViewRtn },
    REGISTER: { name: 'register', dataType: { username: "" as string, password: "" as string }, returnType: {} as AuthActionRegisterWebViewRtn },
    GET_LOGIN_STATE: { name: 'loginstate', dataType: {}, returnType: {} as { status: boolean } }
} as const

export const extension_webview_userCommands = {
    GET_LOGED_IN_USER: { name: 'getLogedInUser', dataType: {}, returnType: { user: {} as PrivateWebviewUser | null } },
    IS_BLOCKED_BY: { name: 'isBlockedBy', dataType: { userId: '' as string }, returnType: { isBlocked: false as boolean } },
    HAS_BLOCKED: { name: 'hasBlocked', dataType: { userId: '' as string }, returnType: { hasBlocked: false as boolean } },
    HAS_PENDING_FRIEND_REQUEST: { name: 'hasPendingFriendRequest', dataType: { userId: '' as string }, returnType: { hasRequest: false as boolean } },
    GET_USERS: { name: 'getUsers', dataType: { userIds: [] as string[] }, returnType: { user: {} as Record<string, PublicUser> } },
    SEND_FRIEND_REQUEST: { name: 'sendFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },
    IGNORE_FRIEND_REQUEST: { name: 'ignoreFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },

    UPDATE_RELATIONSHIP_LOOKUP: { name: 'updateRelationshipLookup', dataType: { lookuptype: '' as lookuptypes, lookup: [] as string[] }, returnType: {} },
    GET_RELATIONSHIP_LOOKUP: { name: 'getRelationshipLookup', dataType: { lookuptype: '' as lookuptypes }, returnType: { lookup: [] as string[] } },

} as const

export const extension_webview_userFeedbackEmits = {
    UUID_COPIED: { name: 'UUIDCopied', dataType: {}, returnType: {} },
    UUID_INFO: { name: 'UUIDInfo', dataType: {}, returnType: {} }
} as const


export const server_client_chatCommands = {
    GET_CHAT_LIST: { name: 'getChatList', dataType: {}, returnType: {} as ChatList },
    GET_CHATS: { name: 'getChats', dataType: { chatIds: [] as string[] }, returnType: { chats: {} as Record<string, ChatData> } },
    FETCH_MESSAGEIDS: { name: 'fetchMessageIds', dataType: { chatId: '' as string, max: 50 as number, lastMessageId: '' as string | null }, returnType: { messageIds: [] as string[] } },
    GET_MESSAGES: { name: 'getMessages', dataType: { chatId: '' as string, messageIds: [] as string[] }, returnType: { messages: {} as Record<string, MessageData> } },

    TYPING: { name: 'typing', dataType: { userId: '' as string, state: true as boolean }, returnType: {} },
    SEND_MESSAGE: { name: 'sendMessage', dataType: { message: {} as MessageData }, returnType: {} },
    RESIVE_MESSAGE: { name: 'resiveMessage', datatype: { message: {} as MessageData }, returnType: {} },
} as const

export const extension_webview_chatCommands = {
    GET_CHAT_LIST: { name: 'getChatList', dataType: {}, returnType: {} as ChatList },
    GET_CHATS: { name: 'getChats', dataType: { chatIds: [] as string[] }, returnType: { chats: [] as ChatData[] } },
    FETCH_MESSAGES: { name: 'fetchMessages', dataType: { chatId: '' as string, max: 50 as number, lastMessageId: '' as string }, returnType: { messages: [] as MessageData[] } },

    TYPING: { name: 'typing', dataType: { userId: '' as string, state: true as boolean }, returnType: {} },
    SEND_MESSAGE: { name: 'sendMessage', dataType: { message: {} as MessageData }, returnType: {} },
    RESIVE_MESSAGE: { name: 'resiveMessage', dataType: { message: {} as MessageData }, returnType: {} },
} as const