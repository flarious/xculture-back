import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bookmark')              // create a table name events
export class BookmarkEntity {
    
        @PrimaryGeneratedColumn({ name: "ีbookmark_id" })
        id: number;


        // @Column({ name: "user_id" })
        // id: string;


        // @Column({ name: "forum_id" })
        // id: number;


}