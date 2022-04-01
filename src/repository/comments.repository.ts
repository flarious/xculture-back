import { Injectable } from "@nestjs/common";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { UserFavoriteCommentEntity } from "src/entity/comment/commentFavorited.entity";
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

    async favoriteComment(commentID, user) {
        await this.connection.createQueryBuilder()
            .update(CommentsEntity)
            .set(
                { liked: () => "liked_comments + 1" }
            )
            .where("comment_id = :comment_id", {comment_id : commentID})
            .execute();
            
        const favorite = await this.connection.createQueryBuilder()
        .insert()
        .into(UserFavoriteCommentEntity)
        .values({})
        .execute();

        const favoriteCommentId = favorite.identifiers[0].id;

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "favoritedComments")
        .of(user)
        .add(favoriteCommentId);

        await this.connection.createQueryBuilder()
        .relation(CommentsEntity, "favoritedBy")
        .of(commentID)
        .add(favoriteCommentId);
    }

    async unfavoriteComment(commentID, user) {
        await this.connection.createQueryBuilder()
            .update(CommentsEntity)
            .set(
                { liked: () => "liked_comments - 1" }
            )
            .where("comment_id = :comment_id", {comment_id : commentID})
            .execute();

        
        const unfavoriteComment = await this.connection.createQueryBuilder(UserFavoriteCommentEntity, "favoritedComment")
        .select("favoritedComment.id")
        .where("favoritedComment.comment = :comment_id", {comment_id: commentID})
        .andWhere("favoritedComment.user = :user_id", {user_id: user})
        .getOne();

        await this.connection.createQueryBuilder()
        .delete()
        .from(UserFavoriteCommentEntity)
        .where("id = :id", {id: unfavoriteComment.id})
        .execute();

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "favoritedComments")
        .of(user)
        .remove(unfavoriteComment.id);

        await this.connection.createQueryBuilder()
        .relation(CommentsEntity, "favoritedBy")
        .of(commentID)
        .remove(unfavoriteComment.id);
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