import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { ForumEntity } from "./forum.entity";

@Entity("favorite_forum")
export class UserFavoriteForumEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ForumEntity, forum => forum.favoritedBy)
    forum: ForumEntity;

    @ManyToOne(() => UserEntity, user => user.favoritedForums)
    user: UserEntity;
}