import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { ReplyEntity } from "./reply.entity";

@Entity("favorite_reply")
export class UserFavoriteReplyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReplyEntity, reply => reply.favoritedBy)
    reply: ReplyEntity;

    @ManyToOne(() => UserEntity, user => user.favoritedReplies)
    user: UserEntity;
}