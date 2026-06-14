import { Express, Response } from "express";
import { Return } from "@vschat/shared/models/Return"
import { AuthActionChallangeExtensionRtn, AuthActionLoginExtensionRtn, AuthActionRtnCodes } from "@vschat/shared/interfaces/ApiInterfaces"
import { ApiHandleUtils } from "@vschat/shared/Utils/ApiHandleUtils"
import { authactions } from "../services/AuthActions";

function handleReturn<T extends Return>(rtn: T, res: Response) {
    if (rtn.code == AuthActionRtnCodes.success) {
        return res.status(200).json(rtn);
    }
    switch (rtn.code) {
        case AuthActionRtnCodes.userNameAlreadyExists:
            return res.status(409).json(rtn);
        case AuthActionRtnCodes.userNotFound:
            return res.status(404).json(rtn);
        default:
            return res.status(400).json(rtn);
    }
}

export const route = (app: Express) => {
    app.post('/vsc/api/register', async (req, res) => {
        const { username, hashedPassword, publicKey, encryptedPrivatekey, masterkeyPayload } = req.body;
        if (
            !username ||
            !hashedPassword ||
            !publicKey ||
            !encryptedPrivatekey ||
            !masterkeyPayload
        ) return res.sendStatus(400);
        const result = await authactions.register(username, hashedPassword, publicKey, encryptedPrivatekey, masterkeyPayload)
        handleReturn(result, res);
    })
    app.get('/vsc/api/challenge/login/:username', async (req, res) => {
        const result = await authactions.getLoginChallenge(req.params.username);
        handleReturn<AuthActionChallangeExtensionRtn>(result, res);
    })
    app.get('/vsc/api/challenge/recovery/:username', async (req, res) => {
        const result = await authactions.getRecoveryChallenge(req.params.username);
        handleReturn<AuthActionChallangeExtensionRtn>(result, res);
    })
    app.post('/vsc/api/login', async (req, res) => {
        const missing = ApiHandleUtils.getMissingKeys(req.body, ["solvedChallenge", "challenge", "username"])
        const { solvedChallenge, challenge, username } = req.body;
        if (missing.length) return handleReturn<AuthActionLoginExtensionRtn>(new Return(AuthActionRtnCodes.incompleatInformations, missing), res);

        const result = await authactions.login(solvedChallenge, challenge, username);
        handleReturn<AuthActionLoginExtensionRtn>(result, res);
    })
    app.post('/vsc/api/resetpassword', async (req, res) => {
        const { solvedChallenge, challenge, username, hashedNewPassword, newMainSlot } = req.body;
        if (!solvedChallenge || !challenge || !username || !hashedNewPassword || !newMainSlot) return res.sendStatus(400);
        const result = await authactions.resetPassword(solvedChallenge, challenge, username, hashedNewPassword, newMainSlot);
        handleReturn(result, res);
    })
    app.get('/vsc/api/masterkeys/:username', async (req, res) => {
        const result = await authactions.getEncryptedMasterkeysPayload(req.params.username);
        handleReturn(result, res);
    })
}
export const authRoutes = route;