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
    })
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.POST,
    });
    consumer.apply(PreAuthMiddleware).exclude({ path: '/forums/:forumID/viewed', method: RequestMethod.PUT}).forRoutes({
      path: '/**',
      method: RequestMethod.PUT,
    });
  } 
}
