import { Injectable } from "@nestjs/common";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { UserTagEntity } from "src/entity/users/userTag.entity";
import { Connection } from "typeorm";

@Injectable()
export class TagsRepository {
    constructor(private readonly connection: Connection) {}

    async getTags() {
        return await this.connection.createQueryBuilder(TagEntity, "tags")
                    .select("tags")
                    .getMany();
    }

    async changeTags(id, tags) {
        const splitted = id.split("_");
        const itemType = splitted[0];
        const itemId = splitted[1];

        if (itemType == "forum") {
            const oldTag = await this.connection.createQueryBuilder(ForumTagEntity, "forumTag")
            .leftJoin("forumTag.tag", "tag")
            .select(["forumTag", "tag"])
            .where("forumTag.forum = :id", {id: itemId})
            .getMany();

            this.deleteTags(id, oldTag);
            this.useTags(id, tags);
        }
        else if (itemType == "user") {
            const oldTag = await this.connection.createQueryBuilder(UserTagEntity, "userTag")
            .leftJoin("userTag.tag", "tag")
            .select(["userTag", "tag"])
            .where("userTag.user = :id", {id: itemId})
            .getMany();

            this.deleteTags(id, oldTag);
            this.useTags(id, tags);
        }
    }

    async useTags(id, tags) {
        const splitted = id.split("_");
        const itemType = splitted[0];
        const itemId = splitted[1];

        if (itemType == "forum") {
            for (const tag of tags) {
                const newTag = await this.connection.createQueryBuilder()
                .insert()
                .into(ForumTagEntity)
                .values({})
                .execute();
    
                await this.connection.createQueryBuilder()
                .relation(ForumEntity, "tags")
                .of(itemId)
                .add(newTag.identifiers[0].id);

                await this.connection.createQueryBuilder()
                .relation(TagEntity, "forumTagUsages")
                .of(tag)
                .add(newTag.identifiers[0].id);
            }
        }
        else if (itemType == "user") {
            for (const tag of tags) {
                const newTag = await this.connection.createQueryBuilder()
                .insert()
                .into(UserTagEntity)
                .values({})
                .execute();

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "tags")
                .of(itemId)
                .add(newTag.identifiers[0].id);

                await this.connection.createQueryBuilder()
                .relation(TagEntity, "userTagUsages")
                .of(tag)
                .add(newTag.identifiers[0].id);
            }
        }
    }

    async deleteTags(id, tags) {
        const splitted = id.split("_");
        const itemType = splitted[0];
        const itemId = splitted[1];

        if (itemType == "forum") {
            await this.connection.createQueryBuilder()
            .delete()
            .from(ForumTagEntity)
            .where("forum = :id", {id: itemId})
            .execute();

            for (const tag of tags) {
                await this.connection.createQueryBuilder()
                .relation(TagEntity, "forumTagUsages")
                .of(tag.tag)
                .remove(tag);

                await this.connection.createQueryBuilder()
                .relation(ForumEntity, "tags")
                .of(itemId)
                .remove(tag);
            }
        }
        else if (itemType == "user") {
            await this.connection.createQueryBuilder()
            .delete()
            .from(UserTagEntity)
            .where("user = :id", {id: itemId})
            .execute();

            for (const tag of tags) {
                await this.connection.createQueryBuilder()
                .relation(TagEntity, "userTagUsages")
                .of(tag.tag)
                .remove(tag);

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "tags")
                .of(itemId)
                .remove(tag);
            }
        }
    }
}