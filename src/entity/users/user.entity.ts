import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CommentsEntity } from '../comment/comment.entity';
import { UserFavoriteCommentEntity } from '../comment/commentFavorited.entity';
import { CommunityEntity } from '../community/community.entity';
import { CommunityMemberEntity } from '../community/communityMember.entity';
import { EventMemberEntity } from '../events/eventMember.entity';
import { EventsEntity } from '../events/events.entity';
import { ForumEntity } from '../forum/forum.entity';
import { UserFavoriteForumEntity } from '../forum/forumFavorited.entity';
import { MessageEntity } from '../message/message.entity';
import { ReplyEntity } from '../reply/reply.entity';
import { UserFavoriteReplyEntity } from '../reply/replyFavorited.entity';
import { ReportEntity } from '../report/report.entity';
import { UserTagEntity } from './userTag.entity';


@Entity('app_user')              // create a table name events
export class UserEntity {
    
        @PrimaryColumn({ name: "user_id" })
        id: string;


        @Column()
        email: string;


        @Column()
        name: string;


        @Column({ name: "profile_picture_url" })
        profile_pic: string;


        @Column()
        bio: string;


        @Column({
                type: 'enum',
                enum: ["normal", "banned", "admin"],
                default: "normal"
        })
        userType: string;

        @OneToMany(() => UserTagEntity, userTag => userTag.user)
        tags: UserEntity[];

        @OneToMany(() => ForumEntity, forum => forum.author)
        userForums: ForumEntity[];

        @OneToMany(() => UserFavoriteForumEntity, favoriteForums => favoriteForums.user)
        favoritedForums: UserFavoriteForumEntity[];

        @OneToMany(() => CommentsEntity, comment => comment.author)
        userComments: CommentsEntity[];

        @OneToMany(() => UserFavoriteCommentEntity, favoriteComments => favoriteComments.user)
        favoritedComments: UserFavoriteForumEntity[];

        @OneToMany(() => ReplyEntity, reply => reply.author)
        userReplies: ReplyEntity[];

        @OneToMany(() => UserFavoriteReplyEntity, favoriteReplies => favoriteReplies.user)
        favoritedReplies: UserFavoriteForumEntity[];

        @OneToMany(() => CommunityEntity, community => community.owner)
        userCommunities: CommunityEntity[];

        @OneToMany(() => CommunityMemberEntity, member => member.member)
        memberCommunities: CommunityMemberEntity[];

        @OneToMany(() => MessageEntity, message => message.sender)
        userMessages: MessageEntity[];

        @OneToMany(() => EventsEntity, event => event.host)
        userEvents: EventsEntity[];

        @OneToMany(() => EventMemberEntity, member => member.member)
        memberEvents: EventMemberEntity[];

        @OneToMany(() => ReportEntity, report => report.reporter) 
        reports: ReportEntity[];

        @Column()
        banned_amount: number;

        @Column()
        last_banned: Date;
}