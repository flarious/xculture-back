import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('chat')              // create a table name events
export class MessageEntity {
    
        @PrimaryGeneratedColumn({ name: "message_id" })
        id: number;


        @Column()
        sent_date: string;

        
        @Column()
        message: number;


        // @Column({ name: "user_id" })
        // id: number;


        // @Column({ name: "community_id" })
        // id: number;


}