import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityRoomEntity } from '../community/communityRoom.entity';

import { UserEntity } from '../users/user.entity';

@Entity('chat')              // create a table name events
export class MessageEntity {
    
        @PrimaryGeneratedColumn({ name: "message_id" })
        id: string;

        @Column()
        sent_date: Date;
        
        @Column()
        message: string;

        @ManyToOne(() => UserEntity, user => user.userMessages)
        sender: UserEntity;

        @ManyToOne(() => CommunityRoomEntity, room => room.messages)
        room: CommunityRoomEntity;

        @OneToMany(() => MessageEntity, message => message.repliedTo)
        repliedBy: MessageEntity[];

        @ManyToOne(() => MessageEntity, message => message.repliedBy)
        repliedTo: MessageEntity;
}
