import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { MessagesService } from './messages.service';

@Controller('/communities/:commuId/rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(
    @Param("commuId") commuId: string,
    @Param("roomId") roomId: string,
  ) {
    return this.messagesService.findAll(commuId, roomId);
  }

  @Post()
  async createChat(
    @Req() request: Request,
    @Param("roomId") roomId: string,
    @Body("message") message: string,
    @Body("repliedTo") repliedTo: string,
  ) {
    await this.messagesService.createChat(roomId, message, request['user'].id, repliedTo);
  }
}
