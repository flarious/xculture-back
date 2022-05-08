import { Injectable } from "@nestjs/common";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserFavoriteForumEntity } from "src/entity/forum/forumFavorited.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { ReplyEntity } from "src/entity/reply/reply.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
import { ReportRepository } from "./report.repository";
import { TagsRepository } from "./tags.repository";

@Injectable()
export class ForumsRepository {
    constructor(private readonly connection: Connection) {}

    async getForums() {
        const forums =  await this.connection.createQueryBuilder(ForumEntity, "forums")
            .leftJoin("forums.author", "forumAuthor")
            .leftJoin("forums.tags", "tags")
            .leftJoin("tags.tag", "tag")
            .select([
                "forums", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic", 
                "tags", "tag"
            ])
            .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async getForumsRecommended(userId) {
        const user = await this.connection.createQueryBuilder(UserEntity, "user")
        .leftJoin("user.tags", "tags")
        .leftJoin("tags.tag", "tag")
        .select(["user.id", "tags.id", "tag.id"])
        .where("user.id = :id", {id: userId})
        .getOne();

        let recommendedForums;

        if(user.tags.length) {
            const userTags = [];

            for (const tag of user.tags) {
                userTags.push(tag.tag.id);
            }

            recommendedForums = await this.connection.createQueryBuilder(ForumEntity, "forums")
            .leftJoin("forums.author", "forumAuthor")
            .leftJoin("forums.tags", "tags")
            .leftJoin("tags.tag", "tag")
            .select([
                "forums", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic", 
                "tags", "tag"
            ])
            .where("tag.id in (:...userTags)", {userTags: userTags})
            .getMany();

            for (const forum of recommendedForums) {
                forum.id = "forum_" + forum.id;
            }
        }
        else {
            recommendedForums = this.getForums();
        }

        return recommendedForums;
    }

    async getForum(forumID) {
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
            .leftJoin("forum.author", "forumAuthor")
            .leftJoin("forum.tags", "tags")
            .leftJoin("forum.favoritedBy", "forumFavoritedBy")
            .leftJoin("forumFavoritedBy.user", "favoritedForumUser")
            .leftJoin("forum.comments", "comments")
            .leftJoin("comments.author", "commentAuthor")
            .leftJoin("comments.favoritedBy", "commentFavoritedBy")
            .leftJoin("commentFavoritedBy.user", "favoritedCommentUser")
            .leftJoin("comments.replies", "replies")
            .leftJoin("replies.author", "replyAuthor")
            .leftJoin("replies.favoritedBy", "replyFavoritedBy")
            .leftJoin("replyFavoritedBy.user", "favoritedReplyUser")
            .leftJoin("tags.tag", "tag")
            .select([
                "forum", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic",
                "tags", "tag",
                "forumFavoritedBy",
                "favoritedForumUser.id",
                "comments", 
                "commentAuthor.id", "commentAuthor.name", "commentAuthor.profile_pic", 
                "commentFavoritedBy",
                "favoritedCommentUser.id",
                "replies", 
                "replyAuthor.id", "replyAuthor.name", "replyAuthor.profile_pic",
                "replyFavoritedBy",
                "favoritedReplyUser.id"
            ])
            .where("forum.id = :forumID", { forumID: forumID})
            .getOne();

        forum.id = "forum_" + forum.id;

        return forum;
    }

    async createForum(title, subtitle, author, content, thumbnail_url, incognito, tags, viewed, favorite_amount, date, update_date, report_amount) {
        const insertResult = await 
            this.connection.createQueryBuilder()
            .insert()
            .into(ForumEntity)
            .values([
                { 
                    title: title, 
                    subtitle: subtitle, 
                    content: content, 
                    thumbnail: thumbnail_url, 
                    author: author,
                    incognito: incognito, 
                    viewed: viewed, 
                    favorite_amount: favorite_amount, 
                    create_date: date, 
                    update_date: update_date,
                    report_amount: report_amount
                }
            ])
            .execute();
        
        const newForumID = insertResult.identifiers[0].id;

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userForums")
            .of(author)
            .add(newForumID);

        const TagRepository = new TagsRepository(this.connection);
        TagRepository.useTags("forum_" + newForumID, tags);
    }
    
    async updateForum(forumID, title, subtitle, content, thumbnail_url, incognito, tags, update_date) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                {
                    title: title,
                    subtitle: subtitle,
                    content: content,
                    thumbnail: thumbnail_url,
                    incognito: incognito,
                    update_date: update_date,
                }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();
        
        const TagRepository = new TagsRepository(this.connection);
        await TagRepository.changeTags("forum_" + forumID, tags);

    }

    async updateForumView(forumID) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                { viewed: () => "viewed_amount + 1" }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();

    }

    async forumFavorite(forumID, user) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                { favorite_amount: () => "favorite_amount + 1" }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();

            const favorite = await this.connection.createQueryBuilder()
            .insert()
            .into(UserFavoriteForumEntity)
            .values({})
            .execute();
    
            const favoriteForumId = favorite.identifiers[0].id;
    
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "favoritedForums")
            .of(user)
            .add(favoriteForumId)
    
            await this.connection.createQueryBuilder()
            .relation(ForumEntity, "favoritedBy")
            .of(forumID)
            .add(favoriteForumId);

    }

    async forumUnfavorite(forumID, user) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                { favorite_amount: () => "favorite_amount - 1" }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();

        const unfavoriteForum = await this.connection.createQueryBuilder(UserFavoriteForumEntity, "favoritedForum")
            .select("favoritedForum.id")
            .where("favoritedForum.forum = :forum_id", {forum_id: forumID})
            .andWhere("favoritedForum.user = :user_id", {user_id: user})
            .getOne();
    
        await this.connection.createQueryBuilder()
            .delete()
            .from(UserFavoriteForumEntity)
            .where("id = :id", {id: unfavoriteForum.id})
            .execute();
    
        await this.connection.createQueryBuilder()
            .relation(UserEntity, "favoritedForums")
            .of(user)
            .remove(unfavoriteForum.id);
    
        await this.connection.createQueryBuilder()
            .relation(ForumEntity, "favoritedBy")
            .of(forumID)
            .remove(unfavoriteForum.id);    
    }

    async deleteForum(id) {
        const reportRepository = new ReportRepository(this.connection);
        reportRepository.deleteReport("forum", id);

        // Get forum detail to delete
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
        .leftJoin("forum.comments", "comments")
        .leftJoin("forum.author", "forumAuthor")
        .leftJoin("forum.tags", "tags")
        .leftJoin("comments.author", "commentAuthor")
        .leftJoin("comments.replies", "replies")
        .leftJoin("replies.author", "replyAuthor")
        .leftJoin("tags.tag", "tag")
        .select([
            "forum.id", 
            "forumAuthor.id",
            "tags.id", "tag.id",
            "comments.id", 
            "commentAuthor.id",
            "replies.id", 
            "replyAuthor.id"
        ])
        .where("forum.id = :forumID", { forumID: id})
        .getOne();

        // Remove reference of deleted ForumTag on Tag
        for (const tag of forum.tags) {
            await this.connection.createQueryBuilder()
                    .relation(TagEntity, "forumTagUsages")
                    .of(tag.tag)
                    .remove(tag);
        }

        // Since forum will also be deleted, we can just delete the junction table
        await this.connection.createQueryBuilder()
        .delete()
        .from(ForumTagEntity)
        .where("forum = :id", {id: id})
        .execute();

        // Remove reference of author on User
        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userForums")
        .of(forum.author)
        .remove(forum);

        // Delete replies of forum
        for (const comment of forum.comments) {
            // Remove reference of comment author on User
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "userComments")
            .of(comment.author)
            .remove(comment);

            // Remove reference of reply author on User
            for (const reply of comment.replies) {
                await this.connection.createQueryBuilder()
                .relation(UserEntity, "userReplies")
                .of(reply.author)
                .remove(reply);
            }

            await this.connection.createQueryBuilder()
            .delete()
            .from(ReplyEntity)
            .where("comment = :id", {id: comment.id})
            .execute();
        }

        // Delete comments of forum
        await this.connection.createQueryBuilder()
        .delete()
        .from(CommentsEntity)
        .where("forum = :id", {id: forum.id})
        .execute();

        // Delete forum
        await this.connection.createQueryBuilder()
        .delete()
        .from(ForumEntity)
        .where("id = :id", {id: forum.id})
        .execute();

        return forum.author.id;
    }
}