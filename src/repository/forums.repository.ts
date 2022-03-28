import { Injectable } from "@nestjs/common";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
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

    async getForum(forumID) {
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
            .leftJoin("forum.comments", "comments")
            .leftJoin("forum.author", "forumAuthor")
            .leftJoin("forum.tags", "tags")
            .leftJoin("comments.author", "commentAuthor")
            .leftJoin("comments.replies", "replies")
            .leftJoin("replies.author", "replyAuthor")
            .leftJoin("tags.tag", "tag")
            .select([
                "forum", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic",
                "tags", "tag",
                "comments", 
                "commentAuthor.id", "commentAuthor.name", "commentAuthor.profile_pic", 
                "replies", 
                "replyAuthor.id", "replyAuthor.name", "replyAuthor.profile_pic"
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
                    date: date, 
                    update_date: update_date,
                    report_amount: report_amount
                }
            ])
            .execute();
        
        const newForumID = "forum_" + insertResult.identifiers[0].id;

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userForums")
            .of(author)
            .add(newForumID);

        const TagRepository = new TagsRepository(this.connection);
        TagRepository.useTags(newForumID, tags);
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

    async forumFavorite(forumID) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                { favorite_amount: () => "favorite_amount + 1" }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();

    }

    async forumUnfavorite(forumID) {
        await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set(
                { favorite_amount: () => "favorite_amount - 1" }
            )
            .where("forum_id = :forum_id", {forum_id: forumID})
            .execute();

    }
}