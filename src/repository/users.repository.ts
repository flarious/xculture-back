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

    async insert(uid: string, email: string, name: string, profile_pic: string, bio: string, score: number){
        await this.connection.createQueryBuilder()
            .insert().into(UserEntity)
            .values(
                { 
                    id: uid, 
                    email: email, 
                    name: name,
                    profile_pic: profile_pic,
                    bio: bio,
                    score: score
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