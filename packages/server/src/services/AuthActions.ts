import { Return } from "@vschat/shared/models/Return";
import { AuthActionLoginExtensionRtn, AuthActionRtnCodes } from "@vschat/shared/interfaces/ApiInterfaces"
import { User } from "../models/User";
import { CryptoService } from "./CryptService";
import { userLoader } from "./UserLoader";
import { generate } from 'short-uuid';
import { sessionManager } from "./SessionManager";

export interface loginPayload {
    sessionToken: string;
    encryptedPrivatekey: string;
    encryptedMasterkeyMainSlot: string
}

export interface EncryptedMasterkeysPayload {
    mainSlot: string,
    backupSlots: string[]
    masterkeyProof: string
}

class AuthActions {
    private challenges = {
        login: new Map<string, string>(),
        recovery: new Map<string, string>()
    }

    async register(username: string, hashedPassword: string, publicKey: string, encryptedPrivatekey: string, encryptedMasterkeyPayloads: EncryptedMasterkeysPayload): Promise<Return<AuthActionRtnCodes.userNameAlreadyExists | AuthActionRtnCodes.success, undefined>> {
        if (await this.checkUserNameExist(username)) return new Return(AuthActionRtnCodes.userNameAlreadyExists);

        const userId = generate();
        await userLoader.addData(userId, new User({
            id: userId,
            username: username,
            hashedPassword: hashedPassword,
            publicKey: publicKey,
            encryptedPrivateKey: encryptedPrivatekey,
            encryptedMainSlot: encryptedMasterkeyPayloads.mainSlot,
            encryptedBackupSlots: encryptedMasterkeyPayloads.backupSlots,
            masterKeyProof: encryptedMasterkeyPayloads.masterkeyProof
        }))

        return new Return(AuthActionRtnCodes.success);
    }

    private async checkUserNameExist(username: string) {
        const userMap = await userLoader.getByAlias('username', [username.toLocaleLowerCase()]);
        const user = userMap?.get(username.toLocaleLowerCase());
        return !!user;
    }

    async getLoginChallenge(username: string):
        Promise<
            Return<AuthActionRtnCodes.success, string> |
            Return<AuthActionRtnCodes.userNotFound, undefined>
        > {
        return await this.createChallange(username, 'login');
    }

    async getRecoveryChallenge(username: string):
        Promise<
            Return<AuthActionRtnCodes.success, string> |
            Return<AuthActionRtnCodes.userNotFound, undefined>
        > {
        return await this.createChallange(username, 'recovery');
    }

    private async createChallange(username: string, challengeType: keyof typeof this.challenges):
        Promise<
            Return<AuthActionRtnCodes.success, string> |
            Return<AuthActionRtnCodes.userNotFound, undefined>
        > {
        const user = (await userLoader.getByAlias('username', [username.toLocaleLowerCase()]))?.get(username.toLocaleLowerCase());
        if (!user) return new Return<AuthActionRtnCodes.userNotFound, undefined>(AuthActionRtnCodes.userNotFound);

        const challenge = Math.random().toString(36).substring(2, 15)
        const challengeResult = await CryptoService.deriveHashes(user.data.hashedPassword + challenge);
        const challengeKey = username + challengeType + challenge;
        this.challenges[challengeType].set(challengeKey, challengeResult);
        setTimeout(() => {
            this.challenges[challengeType].delete(challengeKey);
        }, 1000 * 60 * 2)
        return new Return(AuthActionRtnCodes.success, challenge);
    }

    async login(solvedChallenge: string, challenge: string, username: string): Promise<AuthActionLoginExtensionRtn> {
        const checkChallengeResult = await this.checkChallengeResult('login', solvedChallenge, challenge, username);
        if (checkChallengeResult.code !== AuthActionRtnCodes.success) return checkChallengeResult;

        const user = checkChallengeResult.data;
        return new Return<AuthActionRtnCodes.success, loginPayload>(AuthActionRtnCodes.success, {
            sessionToken: await sessionManager.generateSession(user.data.id), // später wird noch sessionlogig ergänzt
            encryptedPrivatekey: user.data.encryptedPrivateKey,
            encryptedMasterkeyMainSlot: user.data.encryptedMainSlot
        });
    }

    async resetPassword(solvedChallenge: string, challenge: string, username: string, hashedNewPassword: string, newMainSlot: string):
        Promise<
            Return<
                AuthActionRtnCodes.challangeExpired |
                AuthActionRtnCodes.invalidChallange |
                AuthActionRtnCodes.userNotFound |
                AuthActionRtnCodes.success
                , undefined>
        > {
        const checkChallengeResult = await this.checkChallengeResult('recovery', solvedChallenge, challenge, username);
        if (checkChallengeResult.code !== AuthActionRtnCodes.success) return checkChallengeResult;

        const user = checkChallengeResult.data;
        user.data.hashedPassword = hashedNewPassword;
        user.data.encryptedMainSlot = newMainSlot;
        return new Return(AuthActionRtnCodes.success);

    }

    async checkChallengeResult(challengeType: keyof typeof this.challenges, solvedChallenge: string, challenge: string, username: string):
        Promise<
            Return<AuthActionRtnCodes.success, User> |
            Return<
                AuthActionRtnCodes.challangeExpired |
                AuthActionRtnCodes.invalidChallange |
                AuthActionRtnCodes.userNotFound
                , undefined>
        > {
        const challengeKey = username + challengeType + challenge;
        const challengeResult = this.challenges[challengeType].get(challengeKey);
        if (!challengeResult) return new Return<AuthActionRtnCodes.challangeExpired, undefined>(AuthActionRtnCodes.challangeExpired);
        if (challengeResult !== solvedChallenge) return new Return<AuthActionRtnCodes.invalidChallange, undefined>(AuthActionRtnCodes.invalidChallange);
        const user = (await userLoader.getByAlias('username', [username.toLocaleLowerCase()]))?.get(username.toLocaleLowerCase());
        if (!user) return new Return<AuthActionRtnCodes.userNotFound, undefined>(AuthActionRtnCodes.userNotFound);
        return new Return(AuthActionRtnCodes.success, user);
    }

    async getEncryptedMasterkeysPayload(username: string):
        Promise<
            Return<AuthActionRtnCodes.success, EncryptedMasterkeysPayload> |
            Return<AuthActionRtnCodes.userNotFound, undefined>
        > {
        const user = (await userLoader.getByAlias('username', [username.toLocaleLowerCase()]))?.get(username.toLocaleLowerCase());
        if (!user) return new Return<AuthActionRtnCodes.userNotFound, undefined>(AuthActionRtnCodes.userNotFound);
        return new Return(AuthActionRtnCodes.success, {
            mainSlot: user.data.encryptedMainSlot,
            backupSlots: user.data.encryptedBackupSlots,
            masterkeyProof: user.data.masterKeyProof
        });
    }
}

export const authactions = new AuthActions();