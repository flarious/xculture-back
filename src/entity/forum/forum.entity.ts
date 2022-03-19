import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommentsEntity } from '../comment/comment.entity';
import { UserEntity } from '../users/user.entity';
import { ForumTagEntity } from './forumTag.entity';



@Entity('forum')              // create a table name events
export class ForumEntity {
    
        @PrimaryGeneratedColumn({ name: "forum_id" })
        id: number;

        
        @Column()
        date: Date;


        @Column()
        update_date: Date;


        @Column()
        title: string;


        @Column()
        subtitle: string;


        @Column({ length: 1000})
        content: string;


        @Column({ name: "thumbnail_url" })
        thumbnail: string;                      // in case of url


        @Column()
        incognito: boolean;       


        @Column({ name: "viewed_amount" })
        viewed: number;


        @Column()
        favorite_amount: number;


        @ManyToOne(() => UserEntity, user => user.userForums)
        author: UserEntity;


        @OneToMany(() => CommentsEntity, comment => comment.forum)
        comments: CommentsEntity[];

        @OneToMany(() => ForumTagEntity, forumTag => forumTag.forum)
        tags: ForumTagEntity[];

        // @Column({ name: "user_id" })
        // id: number;


        // @Column()
        // report_amount: number;


        // @Column({ name: "comment_id" })
        // id: string;


        // @Column({ name: "tag_id" })
        // id: string;


        // @Column({ name: "picture_id" })
        // id: string;       


}