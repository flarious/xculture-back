import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { EventMemberEntity } from './eventMember.entity';


@Entity('events')              // create a table name events
export class EventsEntity {
    
        @PrimaryGeneratedColumn({ name: "event_id" })
        id: number;

        @Column()
        date: Date;


        @Column()
        name: string;


        @Column({length: 1000})
        body: string;


        @Column()
        thumbnail: string;        // in case of url


        @Column()
        location: string;


        @Column()
        interested_amount: number;


        @ManyToOne(() => UserEntity, user => user.userEvents)
        host: UserEntity;

        @OneToMany(() => EventMemberEntity, member => member.event)
        members: EventMemberEntity[];


        // @Column()
        // report_amount: number;


        // @Column({ name: "user_id" })
        // id: number;



}