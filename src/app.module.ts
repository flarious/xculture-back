import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from './api/comments/comments.module';
import { CommunitiesModule } from './api/communities/communities.module';
import { EventsModule } from './api/events/events.module';
import { ForumsModule } from './api/forums/forums.module';
import { RepliesModule } from './api/replies/replies.module';
import { TagsModule } from './api/tags/tags.module';
import { UsersModule } from './api/users/users.module';
import { PreAuthMiddleware } from './auth/auth.middleware';
import { FirebaseService } from './auth/firebase.service';
import { typeOrmConfigService } from './configs/ormconfig';


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
