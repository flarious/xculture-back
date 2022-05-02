import { Injectable } from '@nestjs/common';
import { RoomRepository } from 'src/repository/room.repository';

@Injectable()
export class RoomService {
    constructor(private readonly repository: RoomRepository) {}

    async findAll(commuId) {
        commuId = commuId.split("_")[1];

        return await this.repository.findAll(commuId);
    }

    async findOne(commuId, roomId) {
        commuId = commuId.split("_")[1];
        roomId = roomId.split("_")[1];

        return await this.repository.findOne(commuId, roomId);
    }

    async createRoom(commuId, name) {
        commuId = commuId.split("_")[1];

        await this.repository.createRoom(commuId, name);
    }

    async updateRoom(roomId, name) {
        roomId = roomId.split("_")[1];

        await this.repository.updateRoom(roomId, name);
    }

    async deleteRoom(roomId) {
        roomId = roomId.split("_")[1];
        
        await this.repository.deleteRoom(roomId);
    }
}
