import { ChatCreateData, ChatData, chatTypes } from "@vschat/shared/interfaces/Chat";
import { User } from "../models/User";
import { Utils } from '@vschat/shared/Utils/GenerlUtils';
import { Return } from "@vschat/shared/models/Return";
import { ChatActionReturnCodes, CreateChatRequestReturn } from '@vschat/shared/interfaces/ChatActionInterfaces'
import { chatLoader } from "./Loader/ChatLoader";
import { UserReference } from "@vschat/shared/interfaces/User";
import { userLoader } from "./Loader/UserLoader";

export class ChatActions {
    constructor() {

    }

    async createChat(creatingUser: User, chatCreateData: ChatCreateData<string>): Promise<CreateChatRequestReturn> {
        let chatData: ChatData<UserReference>;
        switch (chatCreateData.type) {
            case chatTypes.direct:
                if (
                    !chatCreateData.participants.includes(creatingUser.data.id) ||
                    !creatingUser.relationManager.isFriend(chatCreateData.participants.filter(e => e != creatingUser.data.id)[0])
                )
                    return new Return(ChatActionReturnCodes.noPermissions, undefined);

                const userMap = await userLoader.getData(chatCreateData.participants)
                const users = [userMap.get(chatCreateData.participants[0]), userMap.get(chatCreateData.participants[1])].filter(e => !!e);
                if (users.length != 2)
                    return new Return(ChatActionReturnCodes.userNotFound, undefined);
                const ur = users.map(e => e.dataReference);

                chatData = { ...chatCreateData, participants: [ur[0], ur[1]], id: Utils.generateDirectChatId(...chatCreateData.participants) }
                break;
            default:
                return new Return(ChatActionReturnCodes.invalidChatType, undefined);
                break;
        }
        await chatLoader.addData(chatData.id, chatData);
        const chat = (await chatLoader.getData([chatData.id])).get(chatData.id);
        if (!chat) return new Return(ChatActionReturnCodes.internalServerError, undefined);
        return new Return(ChatActionReturnCodes.success, chat.data)
    }
}