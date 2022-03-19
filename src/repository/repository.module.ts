import { Module } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { CommunitiesRepository } from "./communities.repository";
import { EventsRepository } from "./events.repository";
import { ForumsRepository } from "./forums.repository";
import { RepliesRepository } from "./replies.repository";
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
    ],
    exports: [
        ForumsRepository,
        CommentsRepository,
        RepliesRepository,
        TagsRepository,
        UserRepository,
        CommunitiesRepository,
        EventsRepository,
    ]
})
export class RepositoryModule {}