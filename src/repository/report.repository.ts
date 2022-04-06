import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ReportEntity } from "src/entity/report/report.entity";
import { ReportCategoryEntity } from "src/entity/report/reportCategory.entity";
import { ReportTopicEntity } from "src/entity/report/reportTopic.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class ReportRepository {
    constructor(private readonly connection: Connection) {}

    async findAllReportCategory() {
        const categories = await this.connection.createQueryBuilder(ReportCategoryEntity, "categories")
        .getMany();

        return categories;
    }

    async report(id, topics, detail, type, reportDate, approveDate, reporter) {
        // Create report
        const report = await this.connection.createQueryBuilder()
        .insert()
        .into(ReportEntity)
        .values({
            detail: detail,
            reportedType: type,
            reportDate: reportDate,
            approveDate: approveDate,
        })
        .execute();

        // Insert lists of category in report
        for (const topic of topics) {
            const reportTopic = await this.connection.createQueryBuilder()
            .insert()
            .into(ReportTopicEntity)
            .values({})
            .execute();

            await this.connection.createQueryBuilder()
            .relation(ReportEntity, "topics")
            .of(report.identifiers[0].id)
            .add(reportTopic.identifiers[0].id);

            await this.connection.createQueryBuilder()
            .relation(ReportCategoryEntity, "categoryUsage")
            .of(topic)
            .add(reportTopic.identifiers[0].id);
        }

        // Insert report to one of the item type (forum, event, community)
        if (type == "forum") {
            await this.connection.createQueryBuilder()
            .relation(ForumEntity, "reports")
            .of(id)
            .add(report.identifiers[0].id);

            await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set({
                report_amount: () => "report_amount + 1"
            })
            .where("id = :id", {id: id})
            .execute();
        }
        else if (type == "event") {
            await this.connection.createQueryBuilder()
            .relation(EventsEntity, "reports")
            .of(id)
            .add(report.identifiers[0].id);

            await this.connection.createQueryBuilder()
            .update(EventsEntity)
            .set({
                report_amount: () => "report_amount + 1"
            })
            .where("id = :id", {id: id})
            .execute();
        }
        else if (type == "community") {
            await this.connection.createQueryBuilder()
            .relation(CommunityEntity, "reports")
            .of(id)
            .add(report.identifiers[0].id);

            await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set({
                report_amount: () => "report_amount + 1"
            })
            .where("id = :id", {id: id})
            .execute();
        }

        // Insert report to reporter
        await this.connection.createQueryBuilder()
        .relation(UserEntity, "reports")
        .of(reporter)
        .add(report.identifiers[0].id);
    }

    async deleteReport(type, id) {
        let reports;

        switch(type) {
            case "forum":
                // Get Report detail to delete
                reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
                .leftJoin("reports.topics", "topics") // Junction between Report and ReportCategory
                .leftJoin("topics.topic", "topic") // ReportCategory
                .select([
                    "reports.id", 
                    "topics.id", 
                    "topic.id"
                ])
                .where("reports.reportForum = :id", {id: id})
                .andWhere("reports.reportedType = :reportedType", {reportedType: type})
                .getMany();

                // Remove every reference on Report (ReportTopic and ReportCategory)
                for (const report of reports) {
                    // Since report will also be deleted, we can just delete the junction table
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(ReportTopicEntity)
                    .where("report = :id", {id: report.id})
                    .execute();

                    // Remove reference of deleted report's topics on report's category
                    for (const topic of report.topics) {
                        await this.connection.createQueryBuilder()
                        .relation(ReportCategoryEntity, "categoryUsage")
                        .of(topic.topic)
                        .remove(topic);
                    }
                }

                // Delete report
                await this.connection.createQueryBuilder()
                .delete()
                .from(ReportEntity)
                .where("reportForum = :id", {id: id})
                .andWhere("reportedType = :reportedType", {reportedType: type})
                .execute();
                break;
            case "event":
                // Get Report detail to delete
                reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
                .leftJoin("reports.topics", "topics") // Junction between Report and ReportCategory
                .leftJoin("topics.topic", "topic") // ReportCategory
                .select([
                    "reports.id", 
                    "topics.id", 
                    "topic.id"
                ])
                .where("reports.reportEvent = :id", {id: id})
                .andWhere("reports.reportedType = :reportedType", {reportedType: type})
                .getMany();

                // Remove every reference on Report (ReportTopic and ReportCategory)
                for (const report of reports) {
                    // Since report will also be deleted, we can just delete the junction table
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(ReportTopicEntity)
                    .where("report = :id", {id: report.id})
                    .execute();

                    // Remove reference of deleted report's topics on report's category
                    for (const topic of report.topics) {
                        await this.connection.createQueryBuilder()
                        .relation(ReportCategoryEntity, "categoryUsage")
                        .of(topic.topic)
                        .remove(topic);
                    }
                }

                // Delete report
                await this.connection.createQueryBuilder()
                .delete()
                .from(ReportEntity)
                .where("reportEvent = :id", {id: id})
                .andWhere("reportedType = :reportedType", {reportedType: type})
                .execute();
                break;
            case "community":
                // Get Report detail to delete
                reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
                .leftJoin("reports.topics", "topics") // Junction between Report and ReportCategory
                .leftJoin("topics.topic", "topic") // ReportCategory
                .select([
                    "reports.id", 
                    "topics.id", 
                    "topic.id"
                ])
                .where("reports.reportCommu = :id", {id: id})
                .andWhere("reports.reportedType = :reportedType", {reportedType: type})
                .getMany();

                // Remove every reference on Report (ReportTopic and ReportCategory)
                for (const report of reports) {
                    // Since report will also be deleted, we can just delete the junction table
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(ReportTopicEntity)
                    .where("report = :id", {id: report.id})
                    .execute();

                    // Remove reference of deleted report's topics on report's category
                    for (const topic of report.topics) {
                        await this.connection.createQueryBuilder()
                        .relation(ReportCategoryEntity, "categoryUsage")
                        .of(topic.topic)
                        .remove(topic);
                    }
                }

                // Delete report
                await this.connection.createQueryBuilder()
                .delete()
                .from(ReportEntity)
                .where("reportCommu = :id", {id: id})
                .andWhere("reportedType = :reportedType", {reportedType: type})
                .execute();
                break;
        }
        
    }
}