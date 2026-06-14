import { Relationship as iRelationship, RelationshipStatus } from "@vschat/shared/interfaces/User";
import { database } from "../services/DbService";
import { Return } from "@vschat/shared/models/Return";
import { UserActionReturnCodes, UserActionReturnCodesMessageMap } from "@vschat/shared/interfaces/UserActionInterfaces"
import { generate } from "short-uuid";
import { ApiUserController } from "../services/ClientApi/ApiUserController";
import { User } from "./User";

export class Relationship {
    private constructor(private _data: iRelationship) {

    }

    get data() {
        return this._data;
    }

    private async saveRelationShip() {
        const relationIdQuery = await database('Relationships')
            .insert([{
                Id: this.data.id,
                UserId: this.data.userId,
                RelatedUserId: this.data.relatedUserId,
                Status: this.data.status
            }]).onConflict(['UserId', 'RelatedUserId']).merge();
    }

    private static async getRelationship(userId: string, relatedUserId: string) {
        const response = await database('Relationships')
            .select(['Id', 'UserId', 'RelatedUserId', 'Status'])
            .first()
            .where({
                UserId: userId,
                RelatedUserId: relatedUserId
            })

        if (!response) return

        return new Relationship({
            id: response.Id,
            userId: response.UserId,
            relatedUserId: response.RelatedUserId,
            status: response.Status
        })

    }

    private static async createRelationship(userId: string, relatedUserId: string, status: RelationshipStatus) {
        if (userId === relatedUserId) {
            return new Return(UserActionReturnCodes.relatedUserIsUser, {}, UserActionReturnCodesMessageMap[UserActionReturnCodes.relatedUserIsUser])
        }
        const rs = new Relationship({
            id: generate(),
            userId,
            relatedUserId,
            status
        })
        const success = await User.addRelationsip(rs);
        if (!success) return new Return(UserActionReturnCodes.someUserNotFound, rs)
        await rs.saveRelationShip();
        return new Return(UserActionReturnCodes.success, rs)
    }

    static async createFriendRequest(userId: string, relatedUserId: string) {
        const relationShip = await this.getRelationship(relatedUserId, userId);
        if (relationShip?.data.status === RelationshipStatus.friendshipRequested) return await this.acceptFriendRequest(userId, relatedUserId);
        return await this.createRelationship(userId, relatedUserId, RelationshipStatus.friendshipRequested);
    }

    static async IgnoreFriendRequest(userId: string, relatedUserId: string) {
        const relationShip = await this.getRelationship(relatedUserId, userId);
        if (relationShip?.data.status === RelationshipStatus.friendshipRequested) return this.createRelationship(userId, relatedUserId, RelationshipStatus.friendshipRequestIgnored);
        return new Return(UserActionReturnCodes.success);
    }

    static async blockUser(userId: string, relatedUserId: string) {
        return await this.createRelationship(userId, relatedUserId, RelationshipStatus.blocked);
    }

    static async acceptFriendRequest(userId: string, relatedUserId: string) {
        const relationShip = await this.getRelationship(relatedUserId, userId);
        if (relationShip?.data.status === RelationshipStatus.friendshipRequested) {
            await this.createRelationship(relatedUserId, userId, RelationshipStatus.friendship);
            const rtn = new Return(UserActionReturnCodes.success, await this.createRelationship(userId, relatedUserId, RelationshipStatus.friendship));
            return rtn;
        }
        return new Return(UserActionReturnCodes.noFriendRequestToAcceptAvalable, {}, UserActionReturnCodesMessageMap[UserActionReturnCodes.noFriendRequestToAcceptAvalable]);
    }
}