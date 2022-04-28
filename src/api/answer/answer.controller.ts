import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from "express";
import { AnswerService } from './answer.service';

@Controller('/communities/:commuId/answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get(":userId")
  async findAllUserAnswer(
    @Param("commuId") commuId: string,
    @Param("userId") userId: string,
  ) {
    return await this.answerService.findAllUserAnswer(commuId, userId);
  }

  @Post("")
  async create(
    @Req() request: Request,
    @Body("questions") questions: number[],
    @Body("answers") answers: string[],
  ) {
    await this.answerService.create(questions, answers, request['user'].id);
  }
}
