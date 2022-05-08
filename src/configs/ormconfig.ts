import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { AnswerEntity } from "src/entity/answer/answer.entity";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { UserFavoriteCommentEntity } from "src/entity/comment/commentFavorited.entity";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { CommunityRoomEntity } from "src/entity/community/communityRoom.entity";
import { EventMemberEntity } from "src/entity/events/eventMember.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { UserFavoriteForumEntity } from "src/entity/forum/forumFavorited.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { MessageEntity } from "src/entity/message/message.entity";
import { QuestionEntity } from "src/entity/question/question.entity";
import { ReplyEntity } from "src/entity/reply/reply.entity";
import { UserFavoriteReplyEntity } from "src/entity/reply/replyFavorited.entity";
import { ReportEntity } from "src/entity/report/report.entity";
import { ReportCategoryEntity } from "src/entity/report/reportCategory.entity";
import { ReportTopicEntity } from "src/entity/report/reportTopic.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
import { MutualCommunityEntity } from "src/entity/users/mutualCommunity.entity";
import { MutualEventEntity } from "src/entity/users/mutualEvent.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { UserTagEntity } from "src/entity/users/userTag.entity";

@Injectable()
export class typeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
      return {
        type: 'mysql',
        host: process.env.TYPEORM_HOST,
        port: Number(process.env.TYPEORM_PORT),
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,    // Database we want to use
        synchronize: true,                // false if on production -> Might cause problem to real app
                                          // Setting to true will create table (Only table) automatically, still need to create database yourself
        entities: [
            ForumEntity,
            CommentsEntity,
            ReplyEntity,
            TagEntity,
            ForumTagEntity,
            UserTagEntity,
            UserEntity,
            CommunityEntity,
            CommunityMemberEntity,
            CommunityRoomEntity,
            MessageEntity,
            EventsEntity,
            EventMemberEntity,
            ReportEntity,
            ReportTopicEntity,
            ReportCategoryEntity,
            UserFavoriteForumEntity,
            UserFavoriteCommentEntity,
            UserFavoriteReplyEntity,
            QuestionEntity,
            AnswerEntity,
            MutualCommunityEntity,
            MutualEventEntity,
        ]     // Table(s) we want to use
      }
  }
}