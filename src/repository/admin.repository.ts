import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection, createQueryBuilder } from "typeorm";
import { CommunitiesRepository } from "./communities.repository";
import { EventsRepository } from "./events.repository";
import { ForumsRepository } from "./forums.repository";

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
            const forumRepository = new ForumsRepository(this.connection);
            user = await forumRepository.deleteForum(reportedId);
        }
        else if (reportedType == "event") {
            const eventRepository = new EventsRepository(this.connection);
            user = await eventRepository.deleteEvent(reportedId);
        }
        else if (reportedType == "community") {
            const communityRepository = new CommunitiesRepository(this.connection);
            user = await communityRepository.deleteCommu(reportedId);
        }

        // await this.ban(user);
    }

    

    

    
}