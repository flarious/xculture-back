import { Injectable } from "@nestjs/common";
import { AnswerEntity } from "src/entity/answer/answer.entity";
import { QuestionEntity } from "src/entity/question/question.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class AnswerRepository {
    constructor(private readonly connection: Connection) {}

    async findAll(commuId, questionId) {
        const answers = await this.connection.createQueryBuilder(AnswerEntity, "answers")
        .leftJoin("answers.question", "question")
        .where("answers.question = :questionId", {questionId: questionId})
        .andWhere("question.community = :commuId", {commuId: commuId})
        .getMany();

        return answers;
    }

    async findOne(commuId, questionId, answerId) {
        const answer = await this.connection.createQueryBuilder(AnswerEntity, "answer")
        .leftJoin("answer.question", "question")
        .where("answer.id = :answerId", {answerId: answerId})
        .andWhere("answer.question = :questionId", {questionId: questionId})
        .andWhere("question.community = :commuId", {commuId: commuId})
        .getOne();

        return answer;
    }

    async findAllUserAnswer(commuId, userId) {
        const answers = await this.connection.createQueryBuilder(AnswerEntity, "answers")
        .leftJoin("answers.question", "question")
        .leftJoin("answers.respondent", "respondent")
        .select([
            "answers",
            "question.id",
            "respondent.id", "respondent.name", "respondent.profile_pic"
        ])
        .where("respondent.id = :userId", {userId: userId})
        .andWhere("question.community = :commuId", {commuId: commuId})
        .getMany();

        return answers;
    }

    async create(questions, answers, userId, date) {
        for (let i = 0; i < questions.length; i++) {
            const userAnswer = await this.connection.createQueryBuilder()
            .insert()
            .into(AnswerEntity)
            .values({
                answer: answers[i],
                date: date
            })
            .execute();

            await this.connection.createQueryBuilder()
            .relation(QuestionEntity, "answers")
            .of(questions[i])
            .add(userAnswer.identifiers[0].id);

            await this.connection.createQueryBuilder()
            .relation(UserEntity, "joinAnswers")
            .of(userId)
            .add(userAnswer.identifiers[0].id);
        }
    }

    async delete(commuID) {
        const userAnswers = await this.connection.createQueryBuilder(AnswerEntity, "answers")
        .leftJoin("answers.question", "questions")
        .leftJoin("answers.respondent", "respondent")
        .select(["answers.id", "questions.id", "respondent.id"])
        .where("questions.community = :communityId", {communityId: commuID})
        .getMany();


        for (const answer of userAnswers) {
            console.log(answer.respondent);

            await this.connection.createQueryBuilder()
            .relation(QuestionEntity, "answers")
            .of(answer.question)
            .remove(answer.id);

            await this.connection.createQueryBuilder()
            .relation(UserEntity, "joinAnswers")
            .of(answer.respondent)
            .remove(answer.id);

            await this.connection.createQueryBuilder()
            .delete()
            .from(AnswerEntity)
            .where("id = :id", {id: answer.id})
            .execute();
        }
    }

    async deleteUserAnswer(commuID, userId) {
        const userAnswers = await this.connection.createQueryBuilder(AnswerEntity, "answers")
        .leftJoin("answers.question", "questions")
        .select(["answers", "questions"])
        .where("answers.respondent = :userId", {userId: userId})
        .andWhere("questions.community = :communityId", {communityId: commuID})
        .getMany();

        for (const answer of userAnswers) {
            await this.connection.createQueryBuilder()
            .delete()
            .from(AnswerEntity)
            .where("id = :id", {id: answer.id})
            .execute();

            await this.connection.createQueryBuilder()
            .relation(QuestionEntity, "answers")
            .of(answer.question.id)
            .remove(answer.id);

            await this.connection.createQueryBuilder()
            .relation(UserEntity, "joinAnswers")
            .of(userId)
            .remove(answer.id);
        }
    }
}