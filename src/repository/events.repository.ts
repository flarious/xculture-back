import { Injectable } from "@nestjs/common";
import { EventMemberEntity } from "src/entity/events/eventMember.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

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
                    date: date,
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
                    date: date,
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

        
        const eventMember = await this.connection.createQueryBuilder(EventMemberEntity, "eventMember")
                .where("eventMember.member = :id", {id: member})
                .getOne();

        await this.connection.createQueryBuilder()
            .delete()
            .from(EventMemberEntity)
            .where("event = :event", {event : eventID})
            .andWhere("member = :member", {member : member})
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
}