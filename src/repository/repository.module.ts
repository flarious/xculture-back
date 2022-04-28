import { Module } from "@nestjs/common";
import { AdminRepository } from "./admin.repository";
import { AnswerRepository } from "./answers.repository";
import { CommentsRepository } from "./comments.repository";
import { CommunitiesRepository } from "./communities.repository";
import { EventsRepository } from "./events.repository";
import { ForumsRepository } from "./forums.repository";
import { MessageRepository } from "./message.repository";
import { QuestionRepository } from "./questions.repository";
import { RepliesRepository } from "./replies.repository";
import { ReportRepository } from "./report.repository";
import { RoomRepository } from "./room.repository";
import { TagsRepository } from "./tags.repository";
import { UserRepository } from "./users.repository";


@Module({
    providers: [
        ForumsRepository,
        CommentsRepository,
        RepliesRepository,
        TagsRepository,
        UserRepository,
        CommunitiesRepository,
        EventsRepository,
        ReportRepository,
        AdminRepository,
        RoomRepository,
        MessageRepository,
        QuestionRepository,
        AnswerRepository,
    ],
    exports: [
        ForumsRepository,
        CommentsRepository,
        RepliesRepository,
        TagsRepository,
        UserRepository,
        CommunitiesRepository,
        EventsRepository,
        ReportRepository,
        AdminRepository,
        RoomRepository,
        MessageRepository,
        QuestionRepository,
        AnswerRepository,
    ]
})
export class RepositoryModule {}