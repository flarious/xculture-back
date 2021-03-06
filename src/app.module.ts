import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMiddleware } from './api/admin/admin.middleware';
import { AdminModule } from './api/admin/admin.module';
import { CommentsModule } from './api/comments/comments.module';
import { CommunitiesModule } from './api/communities/communities.module';
import { EventsModule } from './api/events/events.module';
import { ForumsModule } from './api/forums/forums.module';
import { RepliesModule } from './api/replies/replies.module';
import { ReportModule } from './api/report/report.module';
import { TagsModule } from './api/tags/tags.module';
import { UsersModule } from './api/users/users.module';
import { PreAuthMiddleware } from './auth/auth.middleware';
import { FirebaseService } from './auth/firebase.service';
import { typeOrmConfigService } from './configs/ormconfig';
import { RoomModule } from './api/room/room.module';
import { MessagesModule } from './api/messages/messages.module';
import { AnswerModule } from './api/answer/answer.module';
import { QuestionModule } from './api/question/question.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: typeOrmConfigService,
    }),
    ForumsModule,
    CommentsModule,
    RepliesModule,
    TagsModule,
    UsersModule,
    CommunitiesModule,
    EventsModule,
    ReportModule,
    AdminModule,
    RoomModule,
    MessagesModule,
    AnswerModule,
    QuestionModule
  ],
  providers: [
    FirebaseService
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: '/user**',
      method: RequestMethod.ALL,
    });
    consumer.apply(PreAuthMiddleware, AdminMiddleware).forRoutes({
      path: '/admins**',
      method: RequestMethod.ALL,
    });
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: 'forums/recommendation',
      method: RequestMethod.GET,
    });
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: 'events/recommendation',
      method: RequestMethod.GET,
    });
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: 'communities/recommendation',
      method: RequestMethod.GET,
    });
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.POST,
    });
    consumer.apply(PreAuthMiddleware).exclude({ path: '/forums/:forumID/viewed', method: RequestMethod.PUT}).forRoutes({
      path: '/**',
      method: RequestMethod.PUT,
    });
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.DELETE,
    });
  } 
}
