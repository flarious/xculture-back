import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('question')              // create a table name events
export class QuestionEntity {
    
        @PrimaryGeneratedColumn({ name: "question_id" })
        id: number;


        @Column("text", { array: true, default: "{}" })
        answer: string[];


        // @Column({ name: "community_id" })
        // id: number;


        // @Column("text", { name: "user_id", array: true, default: "{}" })
        // id: string[];


}