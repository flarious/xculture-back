import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
import { TagsRepository } from "./tags.repository";

@Injectable()
export class UserRepository {
    constructor(private readonly connection: Connection) {}

    async findOne(uid: string){
        const user = await this.connection.createQueryBuilder(UserEntity, "app_user")
            .leftJoin("app_user.userForums", "forums")
            .leftJoin("app_user.userComments", "comments")
            .leftJoin("app_user.userReplies", "replies")
            .leftJoin("app_user.userCommunities", "communities")
            .leftJoin("app_user.memberCommunities", "members")
            .leftJoin("app_user.tags", "tags")
            .leftJoin("tags.tag", "tag")
            .select(["app_user", "forums", "comments", "replies", "communities", "members", "tags", "tag"])
            .where("app_user.id = :id", {id: uid})
            .getOne();
            
        return user;
    }

    async insert(uid: string, email: string, name: string, profile_pic: string, bio: string, banned_amount: number){
        await this.connection.createQueryBuilder()
            .insert().into(UserEntity)
            .values(
                { 
                    id: uid, 
                    email: email, 
                    name: name,
                    profile_pic: profile_pic,
                    bio: bio,
                    banned_amount: banned_amount,
                    last_banned: new Date()
                }
            )
            .execute();

    }

    async update(uid: string, name: string, profile_pic: string, bio: string, tags) {
        await this.connection.createQueryBuilder()
            .update(UserEntity)
            .set(
                { 
                    name: name,
                    profile_pic: profile_pic,
                    bio: bio
                }
            )
            .where("user_id = :id", {id: uid})
            .execute();

        const TagRepository = new TagsRepository(this.connection);
        await TagRepository.changeTags("user_" + uid, tags);
    }

    async banExpired(uid) {
        const base_banned_time = 1;
        const banned_amount = await this.connection.createQueryBuilder(UserEntity, "user")
        .select(["user.banned_amount"])
        .where("user.id = :id", {id: uid})
        .getOne();
        
        await this.connection.createQueryBuilder()
        .update(UserEntity)
        .set({
                userType: "normal"
        })
        .where("user_id = :id", {id: uid})
        .andWhere("userType = :type", {type: "banned"})
        .andWhere("last_banned < NOW() - INTERVAL :banned_length HOUR", {banned_length: base_banned_time * banned_amount.banned_amount})
        .execute();
    }

    async getUserForums(uid: string) {
        const forums =  await this.connection.createQueryBuilder(ForumEntity, "forums")
            .leftJoin("forums.author", "forumAuthor")
            .leftJoin("forums.tags", "tags")
            .leftJoin("tags.tag", "tag")
            .select([
                "forums", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic", 
                "tags", "tag"
            ])
            .where("forumAuthor.id = :id", {id: uid})
            .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async getUserFavoritedForums(uid: string) {
        const forums =  await this.connection.createQueryBuilder(ForumEntity, "forums")
            .leftJoin("forums.author", "forumAuthor")
            .leftJoin("forums.favoritedBy", "favoritedBy")
            .leftJoin("favoritedBy.user", "userFavorited")
            .leftJoin("forums.tags", "tags")
            .leftJoin("tags.tag", "tag")
            .select([
                "forums", 
                "forumAuthor.id", "forumAuthor.name", "forumAuthor.profile_pic", 
                "tags", "tag"
            ])
            .where("userFavorited.id = :id", {id: uid})
            .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async getUserEvents(uid: string) {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
            .leftJoin("events.host", "host")
            .select([
                "events",
                "host.id", "host.name", "host.profile_pic"
            ])
            .where("host.id = :id", {id: uid})
            .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async getUserInterestedEvents(uid: string) {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
            .leftJoin("events.host", "host")
            .leftJoin("events.members", "members")
            .leftJoin("members.member", "userInterested")
            .select([
                "events",
                "host.id", "host.name", "host.profile_pic"
            ])
            .where("userInterested.id = :id", {id: uid})
            .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async getUserCommunities(uid: string) {
        const commus = await this.connection.createQueryBuilder(CommunityEntity, "communities")
            .leftJoin("communities.owner", "owner")
            .select([
                "communities", 
                "owner.id", "owner.name", "owner.profile_pic"
            ])
            .where("owner.id = :id", {id: uid})
            .getMany();

        for (const commu of commus) {
            commu.id = "community_" + commu.id
        }

        return commus;
    }

    async getUserJoinedCommunities(uid: string) {
        const commus = await this.connection.createQueryBuilder(CommunityEntity, "communities")
            .leftJoin("communities.owner", "owner")
            .leftJoin("communities.members", "members")
            .leftJoin("members.member", "userJoined")
            .select([
                "communities", 
                "owner.id", "owner.name", "owner.profile_pic"
            ])
            .where("userJoined.id = :id", {id: uid})
            .getMany();

        for (const commu of commus) {
            commu.id = "community_" + commu.id
        }

        return commus;
    }
}