import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerEntity } from '../answer/answer.entity';
import { CommunityEntity } from '../community/community.entity';


@Entity('question')              // create a table name events
export class QuestionEntity {
    
        @PrimaryGeneratedColumn({ name: "question_id" })
        id: number;


        @Column()
        question: string;

        @OneToMany(() => AnswerEntity, answer => answer.question)
        answers: AnswerEntity[];

        @ManyToOne(() => CommunityEntity, community => community.questions)
        community: CommunityEntity;
        

        // @Column({ name: "community_id" })
        // id: number;


        // @Column("text", { name: "user_id", array: true, default: "{}" })
        // id: string[];


}