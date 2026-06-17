import { Relationship, PublicUser, PrivateUser, PrivateWebviewUser, UserReference } from '../interfaces/User'
import { AuthActionLoginWebViewRtn, AuthActionRegisterWebViewRtn } from '../interfaces/ApiInterfaces'
import { ChatCreateData, ChatList, RawChatListInfos } from '../interfaces/Chat'
import { UserSendFriendRequestReturn } from '../interfaces/UserActionInterfaces'
import { lookuptypes } from '../interfaces/RelationLookuptypes'
import { DecrypredMessageCreateData, DecrypredMessageData, MessageCreateData, MessageData } from '../interfaces/Messages'
import { ChatData } from '../interfaces/Chat'
import { CreateChatRequestReturn } from '../interfaces/ChatActionInterfaces'
import { AppViews, NavigationData } from '../interfaces/WebViewNavigation'


export const server_client_coreCommands = {
    USER_NOT_FOUND: { name: 'userNotFound', dataType: {}, returnType: null }
} as const

export const server_client_userCommands = {
    GET_LOGED_IN_USER: { name: 'getLogedInUser', dataType: {}, returnType: { user: {} as PrivateUser | null } },
    GET_RELATIONS: { name: 'getRelations', dataType: {}, returnType: { relations: [] as Relationship[] } },
    GET_USER: { name: 'getUser', dataType: { userId: '' as string }, returnType: { user: {} as PublicUser | null } },
    GET_USERS: { name: 'getUsers', dataType: { userIds: [] as string[] }, returnType: { user: {} as Record<string, PublicUser> } },
    SEND_FRIEND_REQUEST: { name: 'sendFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },
    IGNORE_FRIEND_REQUEST: { name: 'ignoreFriendRequest', dataType: { userId: '' as string }, returnType: {} as UserSendFriendRequestReturn },
    CLIENT_RELATIONUPDATE: { name: 'relationUpdate', dataType: { relation: {} as Relationship }, returnType: null },
} as const

export const server_client_authCommands = {
    GET_CHAT_SESSION: { name: 'getChatSession', dataType: {}, returnType: { session: '' as string } }
} as const

export const server_client_updateCommands = {
    GET_VERSION: { name: 'getVersion', dataType: {}, returnType: { version: '' as string } },
    DOWNLOAD_VERSION: { name: 'downloadVersion', dataType: {}, returnType: {} as Buffer<ArrayBuffer> }
} as const

export const extension_webview_updateCommands = {
    DOWNLOAD: { name: 'download', dataType: {}, returnType: null }
}
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

    UPDATE_RELATIONSHIP_LOOKUP: { name: 'updateRelationshipLookup', dataType: { lookuptype: '' as lookuptypes, lookup: [] as string[] }, returnType: null },
    GET_RELATIONSHIP_LOOKUP: { name: 'getRelationshipLookup', dataType: { lookuptype: '' as lookuptypes }, returnType: { lookup: [] as string[] } },

} as const

export const extension_webview_userFeedbackEmits = {
    UUID_COPIED: { name: 'UUIDCopied', dataType: {}, returnType: null },
    UUID_INFO: { name: 'UUIDInfo', dataType: {}, returnType: null },
    VIEW_UPDATE: { name: 'ViewUpdate', dataType: { view: '' as AppViews, navigationData: {} as NavigationData }, returnType: null }
} as const


export const server_client_chatCommands = {
    GET_CHATS: { name: 'getChats', dataType: { chatIds: [] as string[] }, returnType: { chats: {} as Record<string, ChatData<UserReference>> } },
    CREATE_CHAT: { name: 'createChat', dataType: { chatCreateData: {} as ChatCreateData<string> }, returnType: { chat: {} as CreateChatRequestReturn } },
    FETCH_MESSAGEIDS: { name: 'fetchMessageIds', dataType: { chatId: '' as string, max: 50 as number, lastMessageId: '' as string | null }, returnType: { messageIds: [] as string[] } },
    GET_MESSAGES: { name: 'getMessages', dataType: { chatId: '' as string, messageIds: [] as string[] }, returnType: { messages: {} as Record<string, MessageData> } },
    SEND_MESSAGE: { name: 'sendMessage', dataType: { message: {} as MessageCreateData }, returnType: null },
    RECIVE_MESSAGE: { name: 'reciveMessage', dataType: { message: {} as MessageData }, returnType: null },
    GET_RAW_CHAT_LIST_BASE_INFOS: { name: 'getChatListBaseInfos', dataType: {}, returnType: { chats: {} as Record<string, RawChatListInfos> } },
    GET_LAST_READERMESSAGE: { name: 'getLastReadedMessage', dataType: { chatId: '' as string }, returnType: { messageId: '' as string } },
    MARK_CHAT_AS_READED: { name: 'markChatAsReaded', dataType: { chatId: '' as string, messageId: '' as string }, returnType: null },
    REQUEST_CHAT_MARKING_READ: { name: 'requestChatMarkingRead', dataType: { chatId: '' as string }, returnType: null },



    //todo
    TYPING: { name: 'typing', dataType: { userId: '' as string, state: true as boolean }, returnType: null },
} as const

export const extension_webview_chatCommands = {
    GET_CHATS: { name: 'getChats', dataType: { chatIds: [] as string[] }, returnType: { chats: {} as Record<string, ChatData<UserReference>> } },
    GET_FRIEND_CHAT: { name: 'getFriendChat', dataType: { userId: '' as string }, returnType: { chat: null as ChatData<UserReference> | null } },
    FETCH_MESSAGES: { name: 'fetchMessages', dataType: { chatId: '' as string, max: 50 as number, lastMessageId: '' as string | null }, returnType: { messages: [] as DecrypredMessageData[] } },
    GET_MESSAGES: { name: 'getMessages', dataType: { chatId: '' as string, messageIds: [] as string[] }, returnType: { messages: {} as Record<string, DecrypredMessageData> } },
    SEND_MESSAGE: { name: 'sendMessage', dataType: { message: {} as DecrypredMessageCreateData }, returnType: null },
    RECIVE_MESSAGE: { name: 'reciveMessage', dataType: { message: {} as DecrypredMessageData }, returnType: null },
    GET_CHAT_LIST: { name: 'getChatList', dataType: {}, returnType: {} as ChatList },
    SEND_CHAT_LIST_LOOKUP: { name: 'sendChatListLookup', dataType: {} as ChatList, returnType: null },
    REQUEST_CHAT_MARKING_READ: { name: 'requestChatMarkingRead', dataType: { chatId: '' as string }, returnType: null },
    GET_LAST_READERMESSAGE: { name: 'getLastReadedMessage', dataType: { chatId: '' as string }, returnType: { messageId: '' as string } },
    MARK_CHAT_AS_READED: { name: 'markChatAsReaded', dataType: { chatId: '' as string, messageId: '' as string }, returnType: null },
    OPEN_CHAT: { name: 'openChat', dataType: { chatId: '' as string }, returnType: null },

    //todo
    TYPING: { name: 'typing', dataType: { userId: '' as string, state: true as boolean }, returnType: null },
} as const