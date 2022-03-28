import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReportEntity } from "./report.entity";
import { ReportCategoryEntity } from "./reportCategory.entity";

@Entity("report_topic")
export class ReportTopicEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReportEntity, report => report.topics)
    report: ReportEntity;

    @ManyToOne(() => ReportCategoryEntity, category => category.categoryUsage)
    topic: ReportCategoryEntity;
}