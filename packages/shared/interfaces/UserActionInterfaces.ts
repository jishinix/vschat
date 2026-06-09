import { iReturn } from "../models/Return"
import { UserReference } from "./User"


export enum UserActionReturnCodes {
    success,
    relatedUserNotfound,
    relatedUserIsUser,
    noFriendRequestToAcceptAvalable,
    notLoggedIn

}

export const UserActionReturnCodesMessageMap = {
    [UserActionReturnCodes.relatedUserNotfound]: 'Nutzer Nicht gefunden',
    [UserActionReturnCodes.relatedUserIsUser]: 'Der angegebene Nutzer bist du selbst.',
    [UserActionReturnCodes.noFriendRequestToAcceptAvalable]: 'Dieser Nutzer hat dir keine freundesanfrage gestellt'
}

export type UserSendFriendRequestReturn =
    iReturn<UserActionReturnCodes.success, UserReference> |
    iReturn<
        UserActionReturnCodes.relatedUserIsUser |
        UserActionReturnCodes.relatedUserNotfound |
        UserActionReturnCodes.notLoggedIn,
        undefined
    >