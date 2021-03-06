import { Injectable } from "@nestjs/common";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { ReplyEntity } from "src/entity/reply/reply.entity";
import { UserFavoriteReplyEntity } from "src/entity/reply/replyFavorited.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class RepliesRepository {
    constructor(private readonly connection: Connection) {}

    async replyComment(commentID, author, body, incognito, favorited, date, update_date) {
        const insertResult = await this.connection.createQueryBuilder()
                .insert()
                .into(ReplyEntity)
                .values(
                    {
                        body: body,
                        author: author,
                        incognito: incognito,
                        liked_reply: favorited,
                        create_date: date,
                        update_date: update_date
                    }
                )
                .execute();

        const newReplyID = insertResult.identifiers[0].id;

        await this.connection.createQueryBuilder()
                .relation(CommentsEntity, "replies")
                .of(commentID)
                .add(newReplyID);
            
        await this.connection.createQueryBuilder()
                .update(CommentsEntity)
                .set(
                    {
                        reply_amount: () => "reply_amount + 1"
                    }
                )
                .where("comment_id = :comment_id", {comment_id: commentID})
                .execute();

        await this.connection.createQueryBuilder()
                    .relation(UserEntity, "userReplies")
                    .of(author)
                    .add(newReplyID);
    }

    async favoriteReply(replyID, user) {
        await this.connection.createQueryBuilder()
                .update(ReplyEntity)
                .set(
                    { liked_reply: () => "liked_reply + 1" }
                )
                .where("reply_id = :reply_id", {reply_id : replyID})
                .execute();

        const favorite = await this.connection.createQueryBuilder()
        .insert()
        .into(UserFavoriteReplyEntity)
        .values({})
        .execute();

        const favoriteReplyId = favorite.identifiers[0].id;

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "favoritedReplies")
        .of(user)
        .add(favoriteReplyId);

        await this.connection.createQueryBuilder()
        .relation(ReplyEntity, "favoritedBy")
        .of(replyID)
        .add(favoriteReplyId);
    }

    async unfavoriteReply(replyID, user) {
        await this.connection.createQueryBuilder()
                .update(ReplyEntity)
                .set(
                    { liked_reply: () => "liked_reply - 1" }
                )
                .where("reply_id = :reply_id", {reply_id : replyID})
                .execute();

        const unfavoriteReply = await this.connection.createQueryBuilder(UserFavoriteReplyEntity, "favoritedReply")
        .select("favoritedReply.id")
        .where("favoritedReply.reply = :reply_id", {reply_id: replyID})
        .andWhere("favoritedReply.user = :user_id", {user_id: user})
        .getOne();

        await this.connection.createQueryBuilder()
        .delete()
        .from(UserFavoriteReplyEntity)
        .where("id = :id", {id: unfavoriteReply.id})
        .execute();

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "favoritedReplies")
        .of(user)
        .remove(unfavoriteReply.id);

        await this.connection.createQueryBuilder()
        .relation(ReplyEntity, "favoritedBy")
        .of(replyID)
        .remove(unfavoriteReply.id);
    }

    async updateReply(replyID, body, incognito, update_date) {
        await this.connection.createQueryBuilder()
                .update(ReplyEntity)
                .set(
                    {
                        body: body,
                        incognito: incognito,
                        update_date: update_date
                    }
                )
                .where("reply_id = :reply_id", {reply_id : replyID})
                .execute();
    }
}