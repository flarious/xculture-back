import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { EventsEntity } from "./events.entity";

@Entity("event_member")
export class EventMemberEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => EventsEntity, event => event.members)
    event: EventsEntity;

    @ManyToOne(() => UserEntity, user => user.memberEvents)
    member: UserEntity;
}