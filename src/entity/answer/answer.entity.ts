import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('answer')              // create a table name events
export class AnswerEntity {
    
        @PrimaryGeneratedColumn({ name: "ีanswer_id" })
        id: number;


        @Column()
        answer: string;


        @Column()
        date: Date;


        // @Column({ name: "user_id" })
        // id: string;


        // @Column({ name: "question_id" })
        // id: number;


}