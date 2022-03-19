import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TagEntity } from '../tags/tag.entity';
import { UserEntity } from './user.entity';

@Entity('user_tag')              // create a table name events
export class UserTagEntity {
    
        @PrimaryGeneratedColumn({ name: "ีuser_tag_id" })
        id: number;

        @ManyToOne(() => UserEntity, user => user.tags)
        user: UserEntity;

        @ManyToOne(() => TagEntity, tag => tag.userTagUsages)
        tag: TagEntity;
}