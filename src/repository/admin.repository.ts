import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ReportEntity } from "src/entity/report/report.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection, createQueryBuilder } from "typeorm";
import { CommunitiesRepository } from "./communities.repository";
import { EventsRepository } from "./events.repository";
import { ForumsRepository } from "./forums.repository";
import { ReportRepository } from "./report.repository";

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

    async findAllForums() {
        const forums = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .leftJoin("forums.author", "author")
        .select([
            "forums.id", "forums.title", "forums.update_date", "forums.viewed", "forums.favorite_amount",
            "author.id", "author.name", "author.email", "author.userType", "author.banned_amount"
        ])
        .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async findAllEvents() {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
        .leftJoin("events.host", "host")
        .select([
            "events.id", "events.name", "events.update_date", "events.interested_amount", "events.event_date", "events.location",
            "host.id", "host.name", "host.email", "host.userType", "host.banned_amount"
        ])
        .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async findAllCommus() {
        const commus = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .leftJoin("commus.owner", "owner")
        .select([
            "commus.id", "commus.name", "commus.update_date", "commus.type", "commus.member_amount",
            "owner.id", "owner.name", "owner.email", "owner.userType", "owner.banned_amount"
        ])
        .getMany();

        for (const commu of commus) {
            commu.id = "community_" + commu.id;
        }

        return commus;
    }

    async findAllUsers() {
        const users = await this.connection.createQueryBuilder(UserEntity, "users")
        .select([
            "users.id", "users.name", "users.email", "users.userType", "users.banned_amount"
        ])
        .getMany();

        return users;
    }

    async findAllReported() {
        const forums = await this.findAllReportedForum();
        const events = await this.findAllReportedEvent();
        const commus = await this.findAllReportedCommunity();

        const reported = [];
        for (const forum of forums) {
            const reportedForum = {}
            reportedForum["id"] = forum.id;
            reportedForum["name"] = forum.title;
            reportedForum["type"] = "forum";
            reportedForum["owner"] = forum.author;
            reportedForum["report_amount"] = forum.report_amount;

            reported.push(reportedForum);
        }
        for (const event of events) {
            const reportedEvent = {}
            reportedEvent["id"] = event.id;
            reportedEvent["name"] = event.name;
            reportedEvent["type"] = "event";
            reportedEvent["owner"] = event.host;
            reportedEvent["report_amount"] = event.report_amount;

            reported.push(reportedEvent);
        }
        for (const commu of commus) {
            const reportedCommu = {}
            reportedCommu["id"] = commu.id;
            reportedCommu["name"] = commu.name;
            reportedCommu["type"] = "community";
            reportedCommu["owner"] = commu.owner;
            reportedCommu["report_amount"] = commu.report_amount;

            reported.push(reportedCommu);
        }

        return reported;
    }

    async findAllStat() {
        const users = await this.connection.createQueryBuilder(UserEntity, "users")
        .getCount();

        const forums = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .getCount();

        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
        .getCount();

        const commus = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .getCount();

        const allStat = {}
        allStat["user"] = users;
        allStat["forum"] = forums;
        allStat["event"] = events;
        allStat["community"] = commus;

        return allStat;
    }

    async findAllForumsStat() {
        const thisMonth = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now())")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const lastMonth = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now()) - 1")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const lastThreeMonths = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) between month(now()) - 3 and month(now()) - 1")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const allForums = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .getCount();

        const forumStat = {}
        forumStat["this_month"] = thisMonth;
        forumStat["last_month"] = lastMonth;
        forumStat["last_3_months"] = lastThreeMonths;
        forumStat["total"] = allForums;

        return forumStat
    }

    async findAllEventsStat() {
        const thisMonth = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now())")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const lastMonth = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now()) - 1")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const lastThreeMonths = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) between month(now()) - 3 and month(now()) - 1")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const allEvents = await this.connection.createQueryBuilder(EventsEntity, "events")
        .getCount();

        const eventStat = {}
        eventStat["this_month"] = thisMonth;
        eventStat["last_month"] = lastMonth;
        eventStat["last_3_months"] = lastThreeMonths;
        eventStat["total"] = allEvents;

        return eventStat;
    }

    async findAllCommusStat() {
        const thisMonth = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now())")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const lastMonth = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now()) - 1")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const lastThreeMonths = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) between month(now()) - 3 and month(now()) - 1")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const allCommus = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .getCount();

        const commuStat = {}
        commuStat["this_month"] = thisMonth;
        commuStat["last_month"] = lastMonth;
        commuStat["last_3_months"] = lastThreeMonths;
        commuStat["total"] = allCommus;

        return commuStat;
    }

    async findAllReportedStat() {
        const reportedForum = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "forum"})
        .getCount();

        const reportedEvent = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "event"})
        .getCount();

        const reportedCommu = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "community"})
        .getCount();

        const allReported = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .getCount();

        const reportedStat = {}
        reportedStat["forum"] = reportedForum;
        reportedStat["event"] = reportedEvent;
        reportedStat["community"] = reportedCommu;
        reportedStat["total"] = allReported;

        return reportedStat;
    }

    async findAllForumsGraph() {
        const today = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const thisMonthName = months[today.getMonth()];
        const oneMonthAgoName = months[today.getMonth() - 1];
        const twoMonthAgoName = months[today.getMonth() - 2];
        const threeMonthAgoName = months[today.getMonth() - 3];

        const thisMonth = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now())")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const oneMonthAgo = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now()) - 1")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const twoMonthAgo = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now()) - 2")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const threeMonthAgo = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .where("month(forums.create_date) = month(now()) - 3")
        .andWhere("year(forums.create_date) = year(now())")
        .getCount();

        const forumGraphData = []
        const thisMonthGraphData = {};
        const oneMonthAgoGraphData = {};
        const twoMonthAgoGraphData = {};
        const thirdMonthAgoGraphData = {};

        thisMonthGraphData["name"] = thisMonthName;
        thisMonthGraphData["amount"] = thisMonth;
        
        oneMonthAgoGraphData["name"] = oneMonthAgoName;
        oneMonthAgoGraphData["amount"] = oneMonthAgo;
        
        twoMonthAgoGraphData["name"] = twoMonthAgoName;
        twoMonthAgoGraphData["amount"] = twoMonthAgo;
        
        thirdMonthAgoGraphData["name"] = threeMonthAgoName;
        thirdMonthAgoGraphData["amount"] = threeMonthAgo;

        forumGraphData.push(thirdMonthAgoGraphData);
        forumGraphData.push(twoMonthAgoGraphData);
        forumGraphData.push(oneMonthAgoGraphData);
        forumGraphData.push(thisMonthGraphData);

        return forumGraphData;
    }

    async findAllEventsGraph() {
        const today = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const thisMonthName = months[today.getMonth()];
        const oneMonthAgoName = months[today.getMonth() - 1];
        const twoMonthAgoName = months[today.getMonth() - 2];
        const threeMonthAgoName = months[today.getMonth() - 3];

        const thisMonth = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now())")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const oneMonthAgo = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now()) - 1")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const twoMonthAgo = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now()) - 2")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const threeMonthAgo = await this.connection.createQueryBuilder(EventsEntity, "events")
        .where("month(events.create_date) = month(now()) - 3")
        .andWhere("year(events.create_date) = year(now())")
        .getCount();

        const eventGraphData = []
        const thisMonthGraphData = {};
        const oneMonthAgoGraphData = {};
        const twoMonthAgoGraphData = {};
        const thirdMonthAgoGraphData = {};

        thisMonthGraphData["name"] = thisMonthName;
        thisMonthGraphData["amount"] = thisMonth;
        
        oneMonthAgoGraphData["name"] = oneMonthAgoName;
        oneMonthAgoGraphData["amount"] = oneMonthAgo;
        
        twoMonthAgoGraphData["name"] = twoMonthAgoName;
        twoMonthAgoGraphData["amount"] = twoMonthAgo;
        
        thirdMonthAgoGraphData["name"] = threeMonthAgoName;
        thirdMonthAgoGraphData["amount"] = threeMonthAgo;

        eventGraphData.push(thirdMonthAgoGraphData);
        eventGraphData.push(twoMonthAgoGraphData);
        eventGraphData.push(oneMonthAgoGraphData);
        eventGraphData.push(thisMonthGraphData);
        

        return eventGraphData;
    }

    async findAllCommusGraph() {
        const today = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const thisMonthName = months[today.getMonth()];
        const oneMonthAgoName = months[today.getMonth() - 1];
        const twoMonthAgoName = months[today.getMonth() - 2];
        const threeMonthAgoName = months[today.getMonth() - 3];

        const thisMonth = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now())")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const oneMonthAgo = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now()) - 1")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const twoMonthAgo = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now()) - 2")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const threeMonthAgo = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .where("month(commus.create_date) = month(now()) - 3")
        .andWhere("year(commus.create_date) = year(now())")
        .getCount();

        const commuGraphData = []
        const thisMonthGraphData = {};
        const oneMonthAgoGraphData = {};
        const twoMonthAgoGraphData = {};
        const thirdMonthAgoGraphData = {};

        thisMonthGraphData["name"] = thisMonthName;
        thisMonthGraphData["amount"] = thisMonth;
        
        oneMonthAgoGraphData["name"] = oneMonthAgoName;
        oneMonthAgoGraphData["amount"] = oneMonthAgo;
        
        twoMonthAgoGraphData["name"] = twoMonthAgoName;
        twoMonthAgoGraphData["amount"] = twoMonthAgo;
        
        thirdMonthAgoGraphData["name"] = threeMonthAgoName;
        thirdMonthAgoGraphData["amount"] = threeMonthAgo;
        
        commuGraphData.push(thirdMonthAgoGraphData);
        commuGraphData.push(twoMonthAgoGraphData);
        commuGraphData.push(oneMonthAgoGraphData);
        commuGraphData.push(thisMonthGraphData);

        return commuGraphData;
    }

    async findAllReportedGraph() {
        const reportedForum = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "forum"})
        .getCount();

        const reportedEvent = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "event"})
        .getCount();

        const reportedCommu = await this.connection.createQueryBuilder(ReportEntity, "reports")
        .where("reports.reportedType = :type", {type: "community"})
        .getCount();

        const reportedGraphData = []
        const forumGraphData = {};
        const eventGraphData = {};
        const commuGraphData = {};

        forumGraphData["name"] = "forum";
        forumGraphData["amount"] = reportedForum;
        reportedGraphData.push(forumGraphData);
        eventGraphData["name"] = "event";
        eventGraphData["amount"] = reportedEvent;
        reportedGraphData.push(eventGraphData);
        commuGraphData["name"] = "community";
        commuGraphData["amount"] = reportedCommu;
        reportedGraphData.push(commuGraphData);

        return reportedGraphData;
    }

    async findAllReportedForum() {
        const forums = await this.connection.createQueryBuilder(ForumEntity, "forums")
        .leftJoin("forums.author", "author")
        .select([
            "forums.id", "forums.title", "forums.report_amount",
            "author.id", "author.name", "author.email", "author.userType", "author.banned_amount"
        ])
        .where("forums.report_amount > 0")
        .getMany();

        for (const forum of forums) {
            forum.id = "forum_" + forum.id;
        }

        return forums;
    }

    async findOneReportedForum(id) {
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
        .leftJoin("forum.author", "author")
        .select([
            "forum.id", "forum.title", "forum.subtitle", "forum.content", "forum.create_date", "forum.update_date",
            "author.id", "author.name", "author.email", "author.userType", "author.banned_amount"
        ])
        .where("forum.report_amount > 0")
        .andWhere("forum.id = :id", {id: id})
        .getOne()

        forum.id = "forum_" + forum.id;

        return forum;
    }

    async findAllReportedEvent() {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
        .leftJoin("events.host", "host")
        .select([
            "events.id", "events.name", "events.report_amount",
            "host.id", "host.name", "host.email", "host.userType", "host.banned_amount"
        ])
        .where("events.report_amount > 0")
        .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async findOneReportedEvent(id) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.host", "host")
        .select([
            "event.id", "event.name", "event.location", "event.body", "event.create_date", "event.update_date", "event.event_date",
            "host.id", "host.name", "host.email", "host.userType", "host.banned_amount"
        ])
        .where("event.report_amount > 0")
        .andWhere("event.id = :id", {id: id})
        .getOne();

        event.id = "event_" + event.id;

        return event;
    }
    
    async findAllReportedCommunity() {
        const communities = await this.connection.createQueryBuilder(CommunityEntity, "commus")
        .leftJoin("commus.owner", "owner")
        .select([
            "commus.id", "commus.name", "commus.report_amount",
            "owner.id", "owner.name", "owner.email", "owner.userType", "owner.banned_amount"
        ])
        .where("commus.report_amount > 0")
        .getMany();

        for (const community of communities) {
            community.id = "community_" + community.id;
        }

        return communities;
    }

    async findOneReportedCommunity(id) {
        const community = await this.connection.createQueryBuilder(CommunityEntity, "commu")
        .leftJoin("commu.owner", "owner")
        .select([
            "commu.id", "commu.name", "commu.shortdesc", "commu.desc", "commu.type", "commu.create_date", "commu.update_date",
            "owner.id", "owner.name", "owner.email", "owner.userType", "owner.banned_amount"
        ])
        .where("commu.report_amount > 0")
        .andWhere("commu.id = :id", {id: id})
        .getOne();

        community.id = "community_" + community.id;

        return community;
    }

    async findAllOneReportedDetail(type, id) {
        let reports;

        if (type == "forum") {
            reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
            .leftJoin("reports.reporter", "reporter")
            .leftJoin("reports.topics", "topics")
            .leftJoin("topics.topic", "topic")
            .select([
                "reports.id", "reports.detail", "reports.reportDate",
                "reporter.id", "reporter.name", "reporter.email", "reporter.userType", "reporter.banned_amount",
                "topics", "topic.category"
            ])
            .where("reports.reportForum = :id", {id: id})
            .getMany();
        }
        else if (type == "event") {
            reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
            .leftJoin("reports.reporter", "reporter")
            .leftJoin("reports.topics", "topics")
            .leftJoin("topics.topic", "topic")
            .select([
                "reports.id", "reports.detail", "reports.reportDate",
                "reporter.id", "reporter.name", "reporter.email", "reporter.userType", "reporter.banned_amount",
                "topics", "topic.category"
            ])
            .where("reports.reportEvent = :id", {id: id})
            .getMany();
        }
        else if (type == "community") {
            reports = await this.connection.createQueryBuilder(ReportEntity, "reports")
            .leftJoin("reports.reporter", "reporter")
            .leftJoin("reports.topics", "topics")
            .leftJoin("topics.topic", "topic")
            .select([
                "reports.id", "reports.detail", "reports.reportDate",
                "reporter.id", "reporter.name", "reporter.email", "reporter.userType", "reporter.banned_amount",
                "topics", "topic.category"
            ])
            .where("reports.reportCommu = :id", {id: id})
            .getMany();
        }

        for (const report of reports) {
            report.id = "report_" + report.id;
        }

        return reports;
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

    async unban(id) {
        await this.connection.createQueryBuilder()
        .update(UserEntity)
        .set({
                userType: "normal"
        })
        .where("user_id = :id", {id: id})
        .andWhere("userType = :type", {type: "banned"})
        .execute();
    }

    async deleteForumAndBan(id) {
        const forum = await this.connection.createQueryBuilder(ForumEntity, "forum")
        .leftJoin("forum.author", "author")
        .select(["forum.id", "author.id"])
        .where("forum.id = :id", {id: id})
        .getOne();

        const forumRepository = new ForumsRepository(this.connection);
        await forumRepository.deleteForum(id);

        await this.ban(forum.author.id);
    }

    async deleteEventAndBan(id) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.host", "host")
        .select(["event.id", "host.id"])
        .where("event.id = :id", {id: id})
        .getOne();
        
        const eventRepository = new EventsRepository(this.connection);
        await eventRepository.deleteEvent(id);

        await this.ban(event.host.id);
    }

    async deleteCommuAndBan(id) {
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "commu")
        .leftJoin("commu.owner", "owner")
        .select(["commu.id", "owner.id"])
        .where("commu.id = :id", {id: id})
        .getOne();
        
        const communityRepository = new CommunitiesRepository(this.connection);
        await communityRepository.deleteCommu(id);

        await this.ban(commu.owner.id);
    }

    async deleteRejectedReports(type, id) {
        const reportRepository = new ReportRepository(this.connection);
        await reportRepository.deleteReport(type, id);

        if (type == "forum") {
            await this.connection.createQueryBuilder()
            .update(ForumEntity)
            .set({
                report_amount: 0,
            })
            .where("id = :id", {id: id})
            .execute();
        }
        else if (type == "event") {
            await this.connection.createQueryBuilder()
            .update(EventsEntity)
            .set({
                report_amount: 0,
            })
            .where("id = :id", {id: id})
            .execute();
        }
        else if (type == "community") {
            await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set({
                report_amount: 0,
            })
            .where("id = :id", {id: id})
            .execute();
        }
    }    
}