import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityEntity } from '../community/community.entity';
import { EventsEntity } from '../events/events.entity';
import { ForumEntity } from '../forum/forum.entity';
import { UserEntity } from '../users/user.entity';
import { ReportTopicEntity } from './reportTopic.entity';

@Entity("report_card")
export class ReportEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => ReportTopicEntity, reportTopic => reportTopic.report)
    topics: ReportTopicEntity[];

    @Column()
    detail: string;

    @Column()
    reportDate: Date;
    
    @ManyToOne(() => UserEntity, user => user.reports) 
    reporter: UserEntity;

    @ManyToOne(() => ForumEntity, forum => forum.reports)
    reportForum: ForumEntity;

    @ManyToOne(() => EventsEntity, event => event.reports)
    reportEvent: EventsEntity;
    
    @ManyToOne(() => CommunityEntity, community => community.reports)
    reportCommu: CommunityEntity;

    @Column({
        type: 'enum',
        enum: ["forum", "event", "community"]
    })
    reportedType: string;

    @Column({
        type: 'enum',
        enum: ["pending", "banned", "unbanned"],
        default: "pending"
    })
    approveStatus: string;

    @Column()
    approveDate: Date;
}