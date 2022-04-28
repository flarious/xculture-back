import { Injectable } from '@nestjs/common';
import { AnswerRepository } from 'src/repository/answers.repository';

@Injectable()
export class AnswerService {
  constructor(private readonly repository: AnswerRepository) {}

  async findAllUserAnswer(commuId, userId) {
    commuId = commuId.split("_")[1];
    return await this.repository.findAllUserAnswer(commuId, userId);
  }

  async create(questions, answers, respondent) {
    const date = new Date();
    this.repository.create(questions, answers, respondent, date);
  }
}
