import { Controller, Get, Param } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('/communities/:commuId/questions')
export class QuestionController {
  constructor(private readonly questionAnswerService: QuestionService) {}

  @Get("")
  async findAll(
    @Param("commuId") commuId: string,
  ) {
    return this.questionAnswerService.findAll(commuId);
  }
}
