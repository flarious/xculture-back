import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "../message/message.entity";
import { CommunityEntity } from "./community.entity";

@Entity()
export class CommunityRoomEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => CommunityEntity, community => community.rooms)
    community: CommunityEntity;

    @OneToMany(() => MessageEntity, message => message.room)
    messages: MessageEntity[];
}