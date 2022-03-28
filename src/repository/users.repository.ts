import { Injectable } from "@nestjs/common";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

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
            .select(["app_user", "forums", "comments", "replies", "communities", "members"])
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

    async update(uid: string, name: string, profile_pic: string, bio: string) {
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
        return await this.connection.createQueryBuilder(ForumEntity, "forums")
        .leftJoin("forums.author", "author")
        .leftJoin("forums.tags", "tags")
        .leftJoin("tags.tag", "tag")
        .select(["forums", "author", "tags", "tag"])
        .where("forums.author.id = :id", {id: uid})
        .getMany();
    }
}