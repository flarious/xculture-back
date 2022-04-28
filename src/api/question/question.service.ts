import { Injectable } from '@nestjs/common';
import { QuestionRepository } from 'src/repository/questions.repository';

@Injectable()
export class QuestionService {
    constructor(private readonly repository: QuestionRepository) {}

    async findAll(commuId) {
        commuId = commuId.split("_")[1];
        return await this.repository.findAll(commuId);
    }
}
