import { database } from "./DbService";
import { generate } from 'short-uuid'



class SessionManager {
    private readonly expirationLimit = 1000 * 60 * 60 * 24 * 7;

    async generateSession(userId: string) {
        const token = generate();

        await database('SessionTokens')
            .insert({
                Token: token,
                UserId: userId,
                CreatedTimestamp: new Date().getTime()
            })

        this.clearExpiredSessions().catch(err => console.error("[Session-CleanUp-Error]", err));

        return token
    }

    async getUserIdByToken(token: string) {
        const minValidTimestamp = new Date().getTime() - this.expirationLimit;
        const rtn = await database('SessionTokens')
            .select('UserId')
            .first()
            .where({ Token: token })
            .whereRaw('CreatedTimestamp > ?', [minValidTimestamp])

        return rtn?.UserId || null
    }

    async clearExpiredSessions(): Promise<void> {
        const minValidTimestamp = Date.now() - this.expirationLimit;
        await database('SessionTokens')
            .where('CreatedTimestamp', '<', minValidTimestamp)
            .del();
    }
}

export const sessionManager = new SessionManager();