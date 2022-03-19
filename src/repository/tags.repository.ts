import { Injectable } from "@nestjs/common";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
import { Connection } from "typeorm";

@Injectable()
export class TagsRepository {
    constructor(private readonly connection: Connection) {}

    async getTags() {
        return await this.connection.createQueryBuilder(TagEntity, "tags")
                    .select("tags")
                    .getMany();
    }

    async useTags(forumID: number, tags: number[]) {
        for (const tag of tags) {
            const insertResult = await 
                this.connection.createQueryBuilder()
                .insert()
                .into(ForumTagEntity)
                .values(
                    {}
                )
                .execute();
        
            await this.connection.createQueryBuilder()
                .relation(ForumEntity, "tags")
                .of(forumID)
                .add(insertResult.identifiers[0].id);

            await this.connection.createQueryBuilder()
                .relation(TagEntity, "forumTagUsages")
                .of(tag)
                .add(insertResult.identifiers[0].id);
        }
    }

    async changeTags(forumID: number, tags: number[]) {
        const selectResult = await 
            this.connection.createQueryBuilder(ForumTagEntity, "forumTag")
            .leftJoinAndSelect("forumTag.forum", "forum")
            .leftJoinAndSelect("forumTag.tag", "tag")
            .where("forum.id = :forum_id", {forum_id: forumID})
            .getMany();
            
        this.deleteTags(forumID, selectResult);
        this.useTags(forumID, tags);
    }

    async deleteTags(forumID: number, tags: ForumTagEntity[]) {
        for (const tag of tags) {
            await this.connection.createQueryBuilder()
                    .relation(TagEntity, "forumTagUsages")
                    .of(tag.tag.id)
                    .remove(tag.id);

            await this.connection.createQueryBuilder()
                    .relation(ForumEntity, "tags")
                    .of(forumID)
                    .remove(tag.id);
        }
    }
}