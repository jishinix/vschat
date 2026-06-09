import { Relationship as iRelationship, RelationshipStatus } from "@vschat/shared/interfaces/User";
import { database } from "../services/DbService";
import { Return } from "@vschat/shared/models/Return";
import { UserActionReturnCodes, UserActionReturnCodesMessageMap } from "@vschat/shared/interfaces/UserActionInterfaces"

export class Relationship {
    private constructor(private _data: iRelationship) {

    }

    get data() {
        return this._data;
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
        const relationIdQuery = await database('Relationships')
            .insert([{
                UserId: userId,
                RelatedUserId: relatedUserId,
                Status: status
            }]).onConflict(['UserId', 'RelatedUserId']).merge().returning('Id');


        const relationId = (relationIdQuery[0].Id ?? relationIdQuery[0]) as number;
        return new Return(
            UserActionReturnCodes.success, new Relationship({
                id: relationId,
                userId,
                relatedUserId,
                status
            })
        )
    }

    static async createFriendRequest(userId: string, relatedUserId: string) {
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
            return await this.createRelationship(userId, relatedUserId, RelationshipStatus.friendship);
        }
        return new Return(UserActionReturnCodes.noFriendRequestToAcceptAvalable, {}, UserActionReturnCodesMessageMap[UserActionReturnCodes.noFriendRequestToAcceptAvalable]);
    }
}