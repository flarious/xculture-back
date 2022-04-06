import { Injectable } from '@nestjs/common';
import { MessageRepository } from 'src/repository/message.repository';

@Injectable()
export class MessagesService {
    constructor(private readonly repository: MessageRepository) {}

    async findAll(commuId, roomId) {
        commuId = commuId.split("_")[1];
        roomId = roomId.split("_")[1];

        return await this.repository.findAll(commuId, roomId);
    }

    async createChat(roomId, message, sender, repliedTo) {
        const send_date = new Date();
        roomId = roomId.split("_")[1];

        await this.repository.createChat(roomId, message, sender, send_date, repliedTo);
    }
}
