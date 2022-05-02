import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityRoomEntity } from "src/entity/community/communityRoom.entity";
import { MessageEntity } from "src/entity/message/message.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class RoomRepository {
    constructor(private readonly connection: Connection) {}

    async findAll(commuId) {
        const rooms = await this.connection.createQueryBuilder(CommunityRoomEntity, "rooms")
        .leftJoin("rooms.community", "community")
        .where("community.id = :commu_id", {commu_id: commuId})
        .getMany();

        for (const room of rooms) {
            room.id = "room_" + room.id;
        }

        return rooms;
    }

    async findOne(commuId, roomId) {
        const room = await this.connection.createQueryBuilder(CommunityRoomEntity, "room")
        .leftJoin("room.community", "community")
        .where("room.id = :room_id", {room_id: roomId})
        .andWhere("community.id = :commu_id", {commu_id: commuId})
        .getOne();

        room.id = "room_" + room.id;

        return room;
    }

    async createRoom(commuId, name) {
        const newRoom = await this.connection.createQueryBuilder().insert().into(CommunityRoomEntity).values({ name: name }).execute();

        const newRoomId = newRoom.identifiers[0].id;

        await this.connection.createQueryBuilder().relation(CommunityEntity, "rooms").of(commuId).add(newRoomId);
    }

    async updateRoom(roomId, name) {
        await this.connection.createQueryBuilder()
        .update(CommunityRoomEntity)
        .set({ name: name })
        .where("id = :room_id", {room_id: roomId})
        .execute();
    }

    async deleteRoom(roomId) {
        const room = await this.connection.createQueryBuilder(CommunityRoomEntity, "room")
        .leftJoin("room.messages", "messages")
        .leftJoin("messages.repliedTo", "repliedTo")
        .leftJoin("messages.sender", "sender")
        .select([
            "room.id",
            "messages.id",
            "repliedTo.id",
            "sender.id"
        ])
        .where("room.id = :id", {id: roomId})
        .getOne();

        for (const message of room.messages) {
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "userMessages")
            .of(message.sender)
            .remove(message);

            await this.connection.createQueryBuilder()
            .relation(MessageEntity, "repliedBy")
            .of(message.repliedTo)
            .remove(message);
        }

        await this.connection.createQueryBuilder()
        .delete()
        .from(MessageEntity)
        .where("room = :id", {id: room.id})
        .execute();

        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityRoomEntity)
        .where("id = :room_id", {room_id: roomId})
        .execute();
    }
}