import { iReturn } from "../models/Return";

export enum AuthActionRtnCodes {
    success,
    userNameAlreadyExists,
    userNotFound,
    challangeExpired,
    invalidChallange,
    incompleatInformations
}

export type AuthActionRegisterRtn = iReturn<AuthActionRtnCodes.incompleatInformations, string[]> | iReturn<AuthActionRtnCodes.userNameAlreadyExists | AuthActionRtnCodes.success, undefined>