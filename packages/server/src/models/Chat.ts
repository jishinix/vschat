import { MessageCreateData, MessageData } from "@vschat/shared/interfaces/Messages";
import { UserReference } from "@vschat/shared/interfaces/User";
import { Chat } from "@vschat/shared/models/Chat";
import { generate } from "short-uuid";
import { MessagesLoader } from "../services/Loader/MessagesLoader";
import { userLoader } from "../services/Loader/UserLoader";
import { protocol } from "electron";


export class ServerChat extends Chat<MessagesLoader, typeof userLoader> {

    async addMessage(mcd: MessageCreateData, user: UserReference) {
        if (!this.checkUserIsAuthorized(user.id)) return;

        const msg: MessageData = {
            ...mcd,
            timestamp: new Date().getTime(),
            id: generate(),
            sender: user
        }

        for (const [, participant] of await this.getParticipants()) {
            if (participant)
                await participant.send(async protocol => {
                    await protocol.chatHandler.sendMsg(msg)
                })
        }

        this.messageLoader.addData(msg.id, msg);

    }
}