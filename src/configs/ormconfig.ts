import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { CommentsEntity } from "src/entity/comment/comment.entity";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { EventMemberEntity } from "src/entity/events/eventMember.entity";
import { EventsEntity } from "src/entity/events/events.entity";
import { ForumEntity } from "src/entity/forum/forum.entity";
import { ForumTagEntity } from "src/entity/forum/forumTag.entity";
import { ReplyEntity } from "src/entity/reply/reply.entity";
import { TagEntity } from "src/entity/tags/tag.entity";
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
            EventsEntity,
            EventMemberEntity,
        ]     // Table(s) we want to use
      }
  }
}