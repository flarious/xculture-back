import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { QuestionEntity } from "src/entity/question/question.entity";
import { Connection } from "typeorm";
import { AnswerRepository } from "./answers.repository";

@Injectable()
export class QuestionRepository {
    constructor(private readonly connection: Connection) {}

    async findAll(commuId) {
        const questions = await this.connection.createQueryBuilder(QuestionEntity, "questions")
        .where("questions.community = :id", {id: commuId})
        .getMany(); 

        return questions;
    }

    async findOne(commuId, questionId) {
        const question = await this.connection.createQueryBuilder(QuestionEntity, "question")
        .where("questions.id = questionId", {questionId: questionId})
        .andWhere("questions.community = commuId", {commuId: commuId})
        .getOne();

        return question;
    }

    async create(commuId, questions) {
        for (const question of questions) {
            const newQuestion = await this.connection.createQueryBuilder()
            .insert()
            .into(QuestionEntity)
            .values({
                question: question,
            })
            .execute();

            await this.connection.createQueryBuilder()
            .relation(CommunityEntity, "questions")
            .of(commuId)
            .add(newQuestion.identifiers[0].id);
        }
    }

    async delete(commuId) {
        const oldQuestions = await this.connection.createQueryBuilder(QuestionEntity, "questions")
        .select("questions.id")
        .where("questions.community = :id", {id: commuId})
        .getMany();

        const answerRepository = new AnswerRepository(this.connection);
        await answerRepository.delete(commuId);

        await this.connection.createQueryBuilder()
        .delete()
        .from(QuestionEntity)
        .where("community = :id", {id: commuId})
        .execute();

        for (const question of oldQuestions) {
            await this.connection.createQueryBuilder()
            .relation(CommunityEntity, "questions")
            .of(commuId)
            .remove(question.id);
        }
    }

    async update(commuId, questions) {
        await this.delete(commuId);
        await this.create(commuId, questions);
    }

}