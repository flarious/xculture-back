import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { CommentsEntity } from "./comment.entity";


@Entity("favorite_comment")
export class UserFavoriteCommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CommentsEntity, comment => comment.favoritedBy)
    comment: CommentsEntity;

    @ManyToOne(() => UserEntity, user => user.favoritedReplies)
    user: UserEntity;
}