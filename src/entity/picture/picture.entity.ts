import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('picture')              // create a table name events
export class PictureEntity {
    
        @PrimaryGeneratedColumn({ name: "ีpicture_id" })
        id: number;


        @Column()
        picture_url: string;


        // @Column({ name: "forum_id" })
        // id: number;


}