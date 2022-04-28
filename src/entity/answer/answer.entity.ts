import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionEntity } from '../question/question.entity';
import { UserEntity } from '../users/user.entity';

@Entity('answer')              // create a table name events
export class AnswerEntity {
    
        @PrimaryGeneratedColumn({ name: "ีanswer_id" })
        id: number;


        @Column()
        answer: string;

        @Column()
        date: Date;


        @ManyToOne(() => UserEntity, user => user.joinAnswers)
        respondent: UserEntity


        @ManyToOne(() => QuestionEntity, question => question.answers)
        question: QuestionEntity;

        // @Column({ name: "user_id" })
        // id: string;


        // @Column({ name: "question_id" })
        // id: number;


}