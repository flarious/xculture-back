import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { RoomService } from './room.service';

@Controller('/communities/:commuId/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAll(
    @Param("commuId") commuId: string,
  ) {
    return await this.roomService.findAll(commuId);
  }

  @Get(":roomId")
  async findOne(
    @Param("commuId") commuId: string,
    @Param("roomId") roomId: string,
  ) {
    return await this.roomService.findOne(commuId, roomId);
  }

  @Post("")
  async createRoom(
    @Req() request: Request,
    @Param("commuId") commuId: string,
    @Body("name") name: string,
  ) {
    await this.roomService.createRoom(commuId, name);
  }

  @Put(":roomId")
  async updateRoom(
    @Param("roomId") roomId: string,
    @Body("name") name: string,
  ) {
    await this.roomService.updateRoom(roomId, name);
  }

  @Delete(":roomId")
  async deleteRoom(
    @Param("roomId") roomId: string,
  ) {
    await this.roomService.deleteRoom(roomId);
  }
}
