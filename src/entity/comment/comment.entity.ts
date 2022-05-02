import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ForumEntity } from '../forum/forum.entity';
import { ReplyEntity } from '../reply/reply.entity';
import { UserEntity } from '../users/user.entity';
import { UserFavoriteCommentEntity } from './commentFavorited.entity';


@Entity('comments')              // create a table name events
export class CommentsEntity {
    
        @PrimaryGeneratedColumn({ name: "comment_id" })
        id: number;


        @Column({ name: "liked_comments" })
        liked: number;

        @OneToMany(() => UserFavoriteCommentEntity, userFavorited => userFavorited.comment)
        favoritedBy: UserFavoriteCommentEntity[];

        @Column({ name: "date" })
        create_date: Date;


        @Column()
        update_date: Date;


        @Column({ name: "body" })
        body: string;


        @Column({ name: "incognito" })
        incognito: boolean;


        @ManyToOne(() => UserEntity, user => user.userComments)
        author: UserEntity;


        @Column()
        reply_amount: number;
        

        @ManyToOne(() => ForumEntity, forum => forum.comments)
        forum: ForumEntity;


        @OneToMany(() => ReplyEntity, reply => reply.comment)
        replies: ReplyEntity[];
}