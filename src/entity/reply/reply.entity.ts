import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommentsEntity } from '../comment/comment.entity';
import { UserEntity } from '../users/user.entity';


@Entity('reply')              // create a table name events
export class ReplyEntity {
    
        @PrimaryGeneratedColumn({ name: "reply_id" })
        id: number;


        @Column()
        liked_reply: number;


        @Column()
        date: Date;


        @Column()
        update_date: Date;


        @Column()
        body: string;


        @ManyToOne(() => UserEntity, user => user.userReplies)
        author: UserEntity;

        
        @Column()
        incognito: boolean;


        @ManyToOne(() => CommentsEntity, comment => comment.replies)
        comment: CommentsEntity;

        


        // @Column({ name: "comment_id" })
        // id: number;


        // @Column({ name: "user_id" })
        // id: number;


        // @Column()
        // post_update: Date;


        // @Column()
        // update_date: Date;


        // @Column()
        // report_amount: number;


}