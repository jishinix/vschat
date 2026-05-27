import { Relationship, PublicUser, PrivateUser } from '../interfaces/User'
import { AuthActionLoginWebViewRtn, AuthActionRegisterWebViewRtn } from '../interfaces/ApiInterfaces'
import { ChatList } from '../interfaces/Chat'


export const server_client_coreCommands = {
    USER_NOT_FOUND: { name: 'userNotFound', dataType: {}, returnType: {} }
} as const

export const server_client_userCommands = {
    GET_LOGED_IN_USER: { name: 'getLogedInUser', dataType: {}, returnType: { user: {} as PrivateUser | null } },
    GET_RELATIONS: { name: 'getRelations', dataType: {}, returnType: { relations: [] as Relationship[] } },
    GET_USER: { name: 'getUser', dataType: { userId: '' as string }, returnType: { user: {} as PublicUser | null } } // name ergänzt & returnType
} as const

export const extension_webview_authCommands = {
    RECOVER: { name: 'recover', dataType: { username: "" as string, backupcode: "" as string, newPassword: "" as string }, returnType: {} as any },
    LOGIN: { name: 'login', dataType: { username: "" as string, password: "" as string }, returnType: {} as AuthActionLoginWebViewRtn },
    REGISTER: { name: 'register', dataType: { username: "" as string, password: "" as string }, returnType: {} as AuthActionRegisterWebViewRtn },
    GET_LOGIN_STATE: { name: 'loginstate', dataType: {}, returnType: {} as { status: boolean } }
} as const

export const extension_webview_chatCommands = {
    GET_CHAT_LIST: { name: 'getChatList', dataType: {}, returnType: {} as ChatList }
} as const