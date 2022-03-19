import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ForumTagEntity } from '../forum/forumTag.entity';
import { UserTagEntity } from '../users/userTag.entity';

@Entity('tag')              // create a table name events
export class TagEntity {
    
        @PrimaryGeneratedColumn({ name: "tag_id" })
        id: number;


        @Column()
        name: string;


        @Column()
        usage_amount: number;
        

        @OneToMany(() => ForumTagEntity, forumTag => forumTag.tag)
        forumTagUsages: ForumTagEntity[];

        @OneToMany(() => UserTagEntity, userTag => userTag.tag)
        userTagUsages: UserTagEntity[];
}