import { iReturn } from "../models/Return";

export enum AuthActionRtnCodes {
    success,
    userNameAlreadyExists,
    userNotFound,
    challangeExpired,
    invalidChallange,
    incompleatInformations,
    internalError
}

export interface loginPayload {
    sessionToken: string;
    encryptedPrivatekey: string;
    encryptedMasterkeyMainSlot: string
}

export type AuthActionRegisterWebViewRtn =
    iReturn<AuthActionRtnCodes.incompleatInformations, string[]> |
    iReturn<
        AuthActionRtnCodes.userNameAlreadyExists |
        AuthActionRtnCodes.success
        , undefined
    >

export type AuthActionLoginWebViewRtn =
    iReturn<AuthActionRtnCodes.incompleatInformations, string[]> |
    iReturn<AuthActionRtnCodes.success, string> |
    iReturn<
        AuthActionRtnCodes.internalError |
        AuthActionRtnCodes.userNotFound |
        AuthActionRtnCodes.invalidChallange |
        AuthActionRtnCodes.challangeExpired
        , undefined
    >

export type AuthActionLoginExtensionRtn =
    iReturn<AuthActionRtnCodes.incompleatInformations, string[]> |
    iReturn<AuthActionRtnCodes.success, loginPayload> |
    iReturn<
        AuthActionRtnCodes.internalError |
        AuthActionRtnCodes.userNotFound |
        AuthActionRtnCodes.invalidChallange |
        AuthActionRtnCodes.challangeExpired
        , undefined
    >

export type AuthActionChallangeExtensionRtn =
    iReturn<AuthActionRtnCodes.incompleatInformations, string[]> |
    iReturn<AuthActionRtnCodes.success, string> |
    iReturn<
        AuthActionRtnCodes.internalError |
        AuthActionRtnCodes.userNotFound
        , undefined
    >