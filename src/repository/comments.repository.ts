import { Injectable } from "@nestjs/common";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class CommentsRepository {
    constructor(private readonly connection: Connection) {}

    async commentForum(forumID, author, body, incognito, favorited, replied, date, update_date) {
        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(CommentsEntity)
            .values(
                {
                    body: body,
                    author: author,
                    incognito: incognito,
                    liked: favorited,
                    reply_amount: replied,
                    date: date,
                    update_date: update_date
                }
            )
            .execute();

        const newCommentID = insertResult.identifiers[0].id;

        await this.connection.createQueryBuilder()
            .relation(ForumEntity, "comments")
            .of(forumID)
            .add(newCommentID);

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userComments")
            .of(author)
            .add(newCommentID);
        
    }

    async favoriteComment(commentID) {
        await this.connection.createQueryBuilder()
            .update(CommentsEntity)
            .set(
                { liked: () => "liked_comments + 1" }
            )
            .where("comment_id = :comment_id", {comment_id : commentID})
            .execute();
    }

    async unfavoriteComment(commentID) {
        await this.connection.createQueryBuilder()
            .update(CommentsEntity)
            .set(
                { liked: () => "liked_comments - 1" }
            )
            .where("comment_id = :comment_id", {comment_id : commentID})
            .execute();
    }

    async updateComment(commentID, body, incognito, update_date) {
        await this.connection.createQueryBuilder()
            .update(CommentsEntity)
            .set(
                {
                    body: body,
                    incognito: incognito,
                    update_date: update_date
                }
            )
            .where("comment_id = :comment_id", {comment_id : commentID})
            .execute();
    }
}