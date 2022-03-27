import { Injectable } from "@nestjs/common";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { EventMemberEntity } from "src/entity/events/eventMember.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { ReplyEntity } from "src/entity/reply/reply.entity";
import { ReportEntity } from "src/entity/report/report.entity";
import { ReportCategoryEntity } from "src/entity/report/reportCategory.entity";
import { ReportTopicEntity } from "src/entity/report/reportTopic.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection, createQueryBuilder } from "typeorm";

@Injectable()
export class AdminRepository {
    constructor(private readonly connection: Connection) {}

    static async checkAdmin(uid) {
        const admin = await createQueryBuilder(UserEntity, "user")
        .where("user.id = :id", {id: uid})
        .andWhere("user.userType = :type", {type: "admin"})
        .getOne();

        if (admin !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }

    async findAllReportedForum() {
        const forums = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("forums.report_amount > 0")
        .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async findOneReportedForum(id) {
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
        .leftJoin("forum.reports", "reports")
        .leftJoin("reports.topics", "topics")
        .leftJoin("topics.topic", "topic")
        .select(["forum", "reports", "topics", "topic"])
        .where("forum.id = :id", {id: id})
        .andWhere("forum.report_amount > 0")
        .getOne();

        forum.id = "forum_" + forum.id;
        
        return forum;
    }

    async findAllReportedEvent() {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("events.report_amount > 0")
        .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async findOneReportedEvent(id) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.reports", "reports")
        .leftJoin("reports.topics", "topics")
        .leftJoin("topics.topic", "topic")
        .select(["event", "reports", "topics", "topic"])
        .andWhere("event.report_amount > 0")
        .where("event.id = :id", {id: id})
        .getOne();

        event.id = "event_" + event.id;

        return event;
    }
    
    async findAllReportedCommunity() {
        const communities = await this.connection.createQueryBuilder(CommunityEntity, "communities")
        .where("communities.report_amount > 0")
        .getMany();

        for (const community of communities) {
            community.id = "community_" + community.id;
        }

        return communities;
    }

    async findOneReportedCommunity(id) {
        const community = await this.connection.createQueryBuilder(CommunityEntity, "community")
        .leftJoin("community.reports", "reports")
        .leftJoin("reports.topics", "topics")
        .leftJoin("topics.topic", "topic")
        .select(["community", "reports", "topics", "topic"])
        .where("community.id = :id", {id: id})
        .andWhere("community.report_amount > 0")
        .getOne();

        community.id = "community_" + community.id;

        return community
    }

    async ban(id) {
        await this.connection.createQueryBuilder()
        .update(UserEntity)
        .set({
            userType: "banned",
            last_banned: new Date(),
            banned_amount: () => "banned_amount + 1"
        })
        .where("id = :id", {id: id})
        .andWhere("userType = :type", {type: "normal"})
        .execute();
        
    }

    async delete(id) {
        const splitted = id.split("_");
        const reportedType = splitted[0];
        const reportedId = splitted[1];
        let user;

        if (reportedType == "forum") {
            user = await this.deleteForum(reportedType, reportedId);
        }
        else if (reportedType == "event") {
            user = await this.deleteEvent(reportedType, reportedId);
        }
        else if (reportedType == "community") {
            user = await this.deleteCommu(reportedType, reportedId);
        }

        console.log(user);
        await this.ban(user);
    }

    async deleteForum(type, id) {
        // Get Report detail to delete
        const reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
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

        // Get forum detail to delete
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
        .leftJoin("forum.comments", "comments")
        .leftJoin("forum.author", "forumAuthor")
        .leftJoin("forum.tags", "tags")
        .leftJoin("comments.author", "commentAuthor")
        .leftJoin("comments.replies", "replies")
        .leftJoin("replies.author", "replyAuthor")
        .leftJoin("tags.tag", "tag")
        .select([
            "forum.id", 
            "forumAuthor.id",
            "tags.id", "tag.id",
            "comments.id", 
            "commentAuthor.id",
            "replies.id", 
            "replyAuthor.id"
        ])
        .where("forum.id = :forumID", { forumID: id})
        .getOne();

        // Remove reference of deleted ForumTag on Tag
        for (const tag of forum.tags) {
            await this.connection.createQueryBuilder()
                    .relation(TagEntity, "forumTagUsages")
                    .of(tag.tag)
                    .remove(tag);
        }

        // Since forum will also be deleted, we can just delete the junction table
        await this.connection.createQueryBuilder()
        .delete()
        .from(ForumTagEntity)
        .where("forum = :id", {id: id})
        .execute();

        // Remove reference of author on User
        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userForums")
        .of(forum.author)
        .remove(forum);

        // Delete replies of forum
        for (const comment of forum.comments) {
            // Remove reference of comment author on User
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "userComments")
            .of(comment.author)
            .remove(comment);

            // Remove reference of reply author on User
            for (const reply of comment.replies) {
                await this.connection.createQueryBuilder()
                .relation(UserEntity, "userReplies")
                .of(reply.author)
                .remove(reply);
            }

            await this.connection.createQueryBuilder()
            .delete()
            .from(ReplyEntity)
            .where("comment = :id", {id: comment.id})
            .execute();
        }

        // Delete comments of forum
        await this.connection.createQueryBuilder()
        .delete()
        .from(CommentsEntity)
        .where("forum = :id", {id: forum.id})
        .execute();

        // Delete forum
        await this.connection.createQueryBuilder()
        .delete()
        .from(ForumEntity)
        .where("id = :id", {id: forum.id})
        .execute();

        return forum.author.id;
    }

    async deleteEvent(type, id) {
        // Get Report detail to delete
        const reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
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

        // Get event detail to delete
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.host", "host")
        .leftJoin("event.members", "members")
        .leftJoin("members.member", "eventMember")
        .select([
            "event.id",
            "host.id", 
            "members.id", 
            "eventMember.id"
        ])
        .where("event.id = :id", {id: id})
        .getOne();

         // Remove reference of deleted people who interest in this event on User
         for (const member of event.members) {
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberEvents")
            .of(member.member)
            .remove(member);
        }

        // Remove reference of host on User
        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userEvents")
        .of(event.host)
        .remove(event);

        // Delete people who interest in this event
        await this.connection.createQueryBuilder()
        .delete()
        .from(EventMemberEntity)
        .where("event = :id", {id: event.id})
        .execute();


        // Delete Event
        await this.connection.createQueryBuilder()
        .delete()
        .from(EventsEntity)
        .where("id = :id", {id: event.id})
        .execute();

        return event.host.id;
    }

    async deleteCommu(type, id) {
        // Get Report detail to delete
        const reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
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

        // Get community detail to delete
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "community")
        .leftJoin("community.owner", "owner")
        .leftJoin("community.members", "members")
        .leftJoin("members.member", "communityMember")
        .select([
            "community.id",
            "owner.id", 
            "members.id", 
            "communityMember.id"
        ])
        .where("community.id = :id", {id: id})
        .getOne();
        
        for (const member of commu.members) {
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberCommunities")
            .of(member.member)
            .remove(member)
        }

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userCommunities")
        .of(commu.owner)
        .remove(commu);

        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityMemberEntity)
        .where("community = :id", {id: commu.id})
        .execute();

        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityEntity)
        .where("id = :id", {id: commu.id})
        .execute();

        return commu.owner.id;
    }
}