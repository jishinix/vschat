import { iReturn } from "../models/Return"
import { ChatData } from "./Chat"
import { UserReference } from "./User"


export enum ChatActionReturnCodes {
    success,
    noPermissions,
    userNotFound,
    invalidChatType,
    internalServerError,
}

export const UserActionReturnCodesMessageMap = {
    [ChatActionReturnCodes.noPermissions]: 'dafür hast du keine permission',
    [ChatActionReturnCodes.userNotFound]: 'Nutzer nicht gefunden',
    [ChatActionReturnCodes.invalidChatType]: 'Chattype ist invalid'
}

export type CreateChatRequestReturn =
    iReturn<ChatActionReturnCodes.success, ChatData<UserReference>> |
    iReturn<
        ChatActionReturnCodes.noPermissions |
        ChatActionReturnCodes.userNotFound |
        ChatActionReturnCodes.invalidChatType |
        ChatActionReturnCodes.internalServerError,
        undefined
    >