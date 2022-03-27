import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ReportTopicEntity } from "./reportTopic.entity";


@Entity('report_category')
export class ReportCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    category: string;

    @OneToMany(() => ReportTopicEntity, reportTopic => reportTopic.topic)
    categoryUsage: ReportTopicEntity[];
}