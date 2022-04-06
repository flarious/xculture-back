import { Injectable } from "@nestjs/common";
import { CommunityRoomEntity } from "src/entity/community/communityRoom.entity";
import { MessageEntity } from "src/entity/message/message.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class MessageRepository {
    constructor(private readonly connection: Connection) {}

    async findAll(commuId, roomId) {
        const chats = await this.connection.createQueryBuilder(MessageEntity, "messages")
        .leftJoin("messages.room", "room")
        .leftJoin("messages.repliedTo", "repliedTo")
        .leftJoin("messages.sender", "sender")
        .leftJoin("repliedTo.sender", "repliedSender")
        .select([
            "messages",
            "room",
            "repliedTo",
            "sender.id", "sender.name", "sender.profile_pic",
            "repliedSender.id", "repliedSender.name", "repliedSender.profile_pic"
        ])
        .where("messages.room = :room_id", {room_id: roomId})
        .andWhere("room.community = :community_id", {community_id: commuId})
        .getMany()

        for (const chat of chats) {
            chat.id = "message_" + chat.id; 
            chat.room.id = "room_" + chat.room.id;
            chat.repliedTo.id = "message_" + chat.repliedTo.id;
        }

        return chats;
    }

    async createChat(roomId, message, sender, send_date, repliedTo) {
        const newChat = await this.connection.createQueryBuilder()
        .insert()
        .into(MessageEntity)
        .values({
            message: message,
            sent_date: send_date,
        })
        .execute();

        const newChatId = newChat.identifiers[0].id;

        repliedTo = repliedTo == 0 ? newChatId : repliedTo;

        await this.connection.createQueryBuilder()
        .relation(MessageEntity, "repliedBy")
        .of(repliedTo)
        .add(newChatId);

        await this.connection.createQueryBuilder()
        .relation(CommunityRoomEntity, "messages")
        .of(roomId)
        .add(newChatId);

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userMessages")
        .of(sender)
        .add(newChatId)
    }
}