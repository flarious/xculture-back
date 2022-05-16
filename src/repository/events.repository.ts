import { Injectable } from "@nestjs/common";
import { EventMemberEntity } from "src/entity/events/eventMember.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { MutualEventEntity } from "src/entity/users/mutualEvent.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
import { ReportRepository } from "./report.repository";
import { UserRepository } from "./users.repository";

@Injectable()
export class EventsRepository {
    constructor(private readonly connection: Connection) {}
    
    async findAll() {
        const events = await this.connection.createQueryBuilder(EventsEntity, "events")
            .leftJoin("events.host", "host")
            .select([
                "events",
                "host.id", "host.name", "host.profile_pic"
            ])
            .getMany();

        for (const event of events) {
            event.id = "event_" + event.id;
        }

        return events;
    }

    async findOne(eventID) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
            .leftJoin("event.host", "host")
            .leftJoin("event.members", "members")
            .leftJoin("members.member", "eventMember")
            .select([
                "event", 
                "host.id", "host.name", "host.profile_pic",
                "members",
                "eventMember.id", "eventMember.name", "eventMember.profile_pic"
            ])
            .where("event.id = :id", {id: eventID})
            .getOne();

        event.id = "event_" + event.id;

        return event;
    }

    async insert(name, host, body, thumbnail, location, interested_amount, date, report_amount) {
        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(EventsEntity)
            .values([
                {
                    name: name,
                    body: body,
                    thumbnail: thumbnail,
                    location: location,
                    interested_amount: interested_amount,
                    event_date: date,
                    create_date: new Date(),
                    update_date: new Date(),
                    report_amount: report_amount
                }
            ])
            .execute();

        const newEventID = insertResult.identifiers[0].id;

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userEvents")
            .of(host)
            .add(newEventID);

        await this.join(newEventID, host);
    }

    async update(eventID, name, body, thumbnail, location, date) {
        await this.connection.createQueryBuilder()
            .update(EventsEntity)
            .set(
                {
                    name: name,
                    body: body,
                    thumbnail: thumbnail,
                    location: location,
                    event_date: date,
                    update_date: new Date(),
                }
            )
            .where("event_id = :id", {id : eventID})
            .execute();
    }

    async join(eventID, member) {
        await this.connection.createQueryBuilder()
            .update(EventsEntity)
            .set(
                {
                    interested_amount: () => "interested_amount + 1"
                }
            )
            .where("event_id = :id", {id : eventID})
            .execute();

        this.mutualMember(eventID, member);

        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(EventMemberEntity)
            .values({})
            .execute();

        const newEventMemberID = insertResult.identifiers[0].id

        await this.connection.createQueryBuilder()
            .relation(EventsEntity, "members")
            .of(eventID)
            .add(newEventMemberID)

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberEvents")
            .of(member)
            .add(newEventMemberID)

        
    }

    async mutualMember(eventID, newMember) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.members", "members")
        .leftJoin("members.member", "member")
        .select(["event.id", "members.id", "member.id"])
        .where("event.id = :id", {id: eventID})
        .getOne();

        
        const userRepository = new UserRepository(this.connection);

        const newMemberMutuals = await userRepository.findOneMutualsEvents(newMember);
        const newMemberMutualsList = newMemberMutuals.MutualEventsWith.map(mutual => mutual.to.id);

        const membersMutualsList = [];

        for (const member of event.members) {
            const memberMutuals = await userRepository.findOneMutualsEvents(member.member.id);
            membersMutualsList.push(memberMutuals.MutualEventsWith.map(mutual => mutual.to.id))
        }

        for (const member of event.members) {
            if (newMemberMutualsList.includes(member.member.id)) {
                await this.connection.createQueryBuilder()
                .update(MutualEventEntity)
                .set({
                    numberOfMutualEvents: () => "numberOfMutualEvents + 1"
                })
                .where("from = :id", {id: newMember})
                .andWhere("to = :userId", {userId: member.member.id})
                .execute();
            }
            else {
                newMemberMutualsList.push(member.member.id);

                const newMutual = await this.connection.createQueryBuilder()
                .insert()
                .into(MutualEventEntity)
                .values({
                    numberOfMutualEvents: 1
                })
                .execute()

                const newMutualId = newMutual.identifiers[0].id;

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualEventsWith")
                .of(newMember)
                .add(newMutualId);

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualEventsTo")
                .of(member.member.id)
                .add(newMutualId);
            }
        }

        for (const member of event.members) {
            const memberIndex = event.members.indexOf(member);
            if (membersMutualsList[memberIndex].includes(newMember)) {
                await this.connection.createQueryBuilder()
                .update(MutualEventEntity)
                .set({
                    numberOfMutualEvents: () => "numberOfMutualEvents + 1"
                })
                .where("from = :id", {id: member.member.id})
                .andWhere("to = :userId", {userId: newMember})
                .execute();
            }
            else {
                membersMutualsList[memberIndex].push(newMember)

                const newMutual = await this.connection.createQueryBuilder()
                .insert()
                .into(MutualEventEntity)
                .values({
                    numberOfMutualEvents: 1
                })
                .execute()

                const newMutualId = newMutual.identifiers[0].id;

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualEventsWith")
                .of(member.member.id)
                .add(newMutualId);

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualEventsTo")
                .of(newMember)
                .add(newMutualId);
            }
        }
    }

    async unMutualMember(eventID, leavingMember) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.members", "members")
        .leftJoin("members.member", "member")
        .select(["event.id", "members.id", "member.id"])
        .where("event.id = :id", {id: eventID})
        .getOne();

        for (const member of event.members) {
            if (member.member.id != leavingMember) {
                await this.connection.createQueryBuilder()
                    .update(MutualEventEntity)
                    .set({
                        numberOfMutualEvents: () => "numberOfMutualEvents - 1"
                    })
                    .where("from = :id", {id: leavingMember})
                    .andWhere("to = :userId", {userId: member.member.id})
                    .execute();

                const mutual = await this.connection.createQueryBuilder(MutualEventEntity, "mutual")
                .where("mutual.from = :id", {id: leavingMember})
                .andWhere("mutual.to = :userId", {userId: member.member.id})
                .getOne();

                if (mutual.numberOfMutualEvents == 0) {
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(MutualEventEntity)
                    .where("from = :id", {id: leavingMember})
                    .andWhere("to = :userId", {userId: member.member.id})
                    .execute();

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualEventsWith")
                    .of(leavingMember)
                    .remove(mutual.id);

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualEventsTo")
                    .of(member.member.id)
                    .remove(mutual.id);
                }
            }
        }

        for (const member of event.members) {
            if (member.member.id != leavingMember) {
                await this.connection.createQueryBuilder()
                    .update(MutualEventEntity)
                    .set({
                        numberOfMutualEvents: () => "numberOfMutualEvents - 1"
                    })
                    .where("from = :id", {id: member.member.id})
                    .andWhere("to = :userId", {userId: leavingMember})
                    .execute();

                const mutual = await this.connection.createQueryBuilder(MutualEventEntity, "mutual")
                .where("mutual.from = :id", {id: member.member.id})
                .andWhere("mutual.to = :userId", {userId: leavingMember})
                .getOne();

                if (mutual.numberOfMutualEvents == 0) {
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(MutualEventEntity)
                    .where("from = :id", {id: member.member.id})
                    .andWhere("to = :userId", {userId: leavingMember})
                    .execute();

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualEventsWith")
                    .of(member.member.id)
                    .remove(mutual.id);

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualEventsTo")
                    .of(leavingMember)
                    .remove(mutual.id);
                }
            }
        }
    }

    async unMutualAll(eventID) {
        const event = await this.connection.createQueryBuilder(EventsEntity, "event")
        .leftJoin("event.members", "members")
        .leftJoin("members.member", "member")
        .select(["event.id", "members.id", "member.id"])
        .where("event.id = :id", {id: eventID})
        .getOne();

        for (const member1 of event.members) {
            for (const member2 of event.members) {
                if (member1.member.id != member2.member.id) {
                    await this.connection.createQueryBuilder()
                    .update(MutualEventEntity)
                    .set({
                        numberOfMutualEvents: () => "numberOfMutualEvents - 1"
                    })
                    .where("from = :id", {id: member1.member.id})
                    .andWhere("to = :userId", {userId: member2.member.id})
                    .execute();

                    const mutual = await this.connection.createQueryBuilder(MutualEventEntity, "mutual")
                    .where("mutual.from = :id", {id: member1.member.id})
                    .andWhere("mutual.to = :userId", {userId: member2.member.id})
                    .getOne();

                    if (mutual.numberOfMutualEvents == 0) {
                        await this.connection.createQueryBuilder()
                        .delete()
                        .from(MutualEventEntity)
                        .where("from = :id", {id: member1.member.id})
                        .andWhere("to = :userId", {userId: member2.member.id})
                        .execute();

                        await this.connection.createQueryBuilder()
                        .relation(UserEntity, "MutualEventsWith")
                        .of(member1.member.id)
                        .remove(mutual.id);

                        await this.connection.createQueryBuilder()
                        .relation(UserEntity, "MutualEventsTo")
                        .of(member2.member.id)
                        .remove(mutual.id);
                    }
                }
            }
        }
    }

    async getEventsRecommended(userId) {
        const userRepository = new UserRepository(this.connection);
        const user = await userRepository.findOneMutualsEvents(userId);

        const joinedEvents = await userRepository.getUserInterestedEvents(userId);
        const joined = await joinedEvents.map(joined => joined.id.split("_")[1]);

        let recommendedEvents; 
        
        if (user.MutualEventsWith.length != 0 && joined.length != 0) {
            const mutualWith = user.MutualEventsWith.map(mutual => mutual.to.id);

            recommendedEvents = await this.connection.createQueryBuilder(EventsEntity, "events")
            .leftJoin("events.host", "host")
            .leftJoin("events.members", "members")
            .leftJoin("members.member", "member")
            .select([
                "events", 
                "host.id", "host.name", "host.profile_pic",
                "members", 
                "member.id", "member.name", "member.profile_pic"
            ])
            .where("events.id not in (:...joined)", {joined: joined})
            .andWhere("member.id in (:...mutualMembers)", {mutualMembers: mutualWith})
            .getMany();

            for (const event of recommendedEvents) {
                event.id = "event_" + event.id;
            }
        }
        else if (user.MutualEventsWith.length == 0 && joined.length != 0) {
            recommendedEvents = await this.connection.createQueryBuilder(EventsEntity, "events")
            .leftJoin("events.host", "host")
            .leftJoin("events.members", "members")
            .leftJoin("members.member", "member")
            .select([
                "events", 
                "host.id", "host.name", "host.profile_pic",
                "members", 
                "member.id", "member.name", "member.profile_pic"
            ])
            .where("events.id not in (:...joined)", {joined: joined})
            .getMany();

            for (const event of recommendedEvents) {
                event.id = "event_" + event.id;
            }
        }
        else {
            recommendedEvents = await this.findAll();
        }

        if (recommendedEvents.length == 0) {
            recommendedEvents = await this.findAll();
        }
        
        return recommendedEvents;
    }

    async unjoin(eventID, member) {
        await this.connection.createQueryBuilder()
            .update(EventsEntity)
            .set(
                {
                    interested_amount: () => "interested_amount - 1"
                }
            )
            .where("event_id = :id", {id : eventID})
            .execute();

        this.unMutualMember(eventID, member);
        
        const eventMember = await this.connection.createQueryBuilder(EventMemberEntity, "eventMember")
            .select("eventMember.id")
            .where("eventMember.member = :member_id", {member_id: member})
            .andWhere("eventMember.event = :event_id", {event_id: eventID})
            .getOne();

        await this.connection.createQueryBuilder()
            .delete()
            .from(EventMemberEntity)
            .where("event = :event", {event : eventID})
            .andWhere("member = :member", {member : member})
            .where("id = :id", {id: eventMember.id})
            .execute();

        await this.connection.createQueryBuilder()
            .relation(EventsEntity, "members")
            .of(eventID)
            .remove(eventMember.id)

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberEvents")
            .of(member)
            .remove(eventMember.id)
    }

    async deleteEvent(id) {
        const reportRepository = new ReportRepository(this.connection);
        reportRepository.deleteReport("event", id);

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
        
        await this.unMutualAll(event.id);

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
}