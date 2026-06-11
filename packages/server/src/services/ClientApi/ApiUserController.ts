import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import { User } from "../../models/User";
import { Socket } from "socket.io";
import { socketWithDataType } from "../WebsocketManager";
import { userLoader } from "../UserLoader";
import { Relationship } from "../../models/Relationship";
import { Return } from "@vschat/shared/models/Return";
import { UserActionReturnCodes, UserSendFriendRequestReturn } from "@vschat/shared/interfaces/UserActionInterfaces";
import { PublicUser, RelationshipStatus } from "@vschat/shared/interfaces/User";


export class ApiUserController extends NamespaceHandler<typeof server_client_userCommands, { socket: socketWithDataType }> {
    handles = {
        getRelations: async (data, extraData) => {
            const user = await extraData.socket.data.getUser()
            return { relations: (await user?.privateData.relations) || [] }
        },
        getLogedInUser: async (data, extraData) => {
            const user = await extraData.socket.data.getUser();
            return { user: user?.privateData || null };
        },
        getUser: async (data, extraData) => {
            const user = (await userLoader.getData([data.userId])).get(data.userId);
            return { user: user?.privateData || null };
        },
        getUsers: async (data, extraData) => {
            const users = (await userLoader.getData(data.userIds));
            const publicUsers = new Map(
                [...users]
                    .filter(([, user]) => user !== null)
                    .map(([key, user]) => [key, user!.privateData])
            );
            return { user: Object.fromEntries(publicUsers) || null };
        },
        sendFriendRequest: async (data, extraData) => {
            const user = await extraData.socket.data.getUser()
            if (!user) return new Return(UserActionReturnCodes.notLoggedIn, undefined);
            const relatedUser = (await userLoader.getData([data.userId])).get(data.userId);
            if (!relatedUser) return new Return(UserActionReturnCodes.relatedUserNotfound, undefined);

            const relationReturn = await Relationship.createFriendRequest(user?.data.id, data.userId);

            if (relationReturn.code === UserActionReturnCodes.success) {
                return new Return(UserActionReturnCodes.success, relatedUser.dataReference)
            }
            return new Return(relationReturn.code, undefined, relationReturn.message);
        },
        ignoreFriendRequest: async (data, extraData) => {
            const user = await extraData.socket.data.getUser()
            if (!user) return new Return(UserActionReturnCodes.notLoggedIn, undefined);
            const relatedUser = (await userLoader.getData([data.userId])).get(data.userId);
            if (!relatedUser) return new Return(UserActionReturnCodes.relatedUserNotfound, undefined);

            const relationReturn = await Relationship.IgnoreFriendRequest(user?.data.id, data.userId);

            if (relationReturn.code === UserActionReturnCodes.success) {
                return new Return(UserActionReturnCodes.success, relatedUser.dataReference)
            }
            return new Return(relationReturn.code, undefined, relationReturn.message);
        }
    } satisfies NamespaceHandler<typeof server_client_userCommands, { socket: socketWithDataType }>['handles'];

    static async sendNewRelationship(relation: Relationship) {
        const usersMap = await userLoader.getData([relation.data.userId, relation.data.relatedUserId]);
        const users = [usersMap.get(relation.data.userId), usersMap.get(relation.data.relatedUserId)].filter(e => !!e);
        if (users.length != 2) return false;
        relation = { data: JSON.parse(JSON.stringify(relation.data)) } as any;
        console.log(relation);
        if (relation.data.status === RelationshipStatus.friendshipRequestIgnored) {
            relation.data.status = RelationshipStatus.none
        }
        for (const [index, user] of users.entries()) {
            user.send((protocol) => {
                protocol.userHandler.emit('relationUpdate', { relation: relation.data })
            })
        }
        return true;
    }

    constructor() {
        super('user', server_client_userCommands)
    }

    async getCurrentLogedInUser(): Promise<User> {
        return {} as User;
    }
}