import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReportEntity } from '../report/report.entity';
import { UserEntity } from '../users/user.entity';
import { CommunityMemberEntity } from './communityMember.entity';
import { CommunityRoomEntity } from './communityRoom.entity';



@Entity('community')              // create a table name events
export class CommunityEntity {
    
        @PrimaryGeneratedColumn({ name: "community_id" })
        id: string;


        @Column()
        name: string;

        /*
        @Column({ name: "type" })
        type: boolean;        // Status
        */


        @Column({ name: "short_desc" })
        shortdesc: string;


        @Column({ name: "desc", length: 1000 })
        desc: string;


        @Column()
        date: Date;


        @Column({ name: "thumbnail" })
        thumbnail: string;

        @Column()
        member_amount: number;

        @ManyToOne(() => UserEntity, user => user.userCommunities)
        owner: UserEntity;

        @OneToMany(() => CommunityMemberEntity, member => member.community)
        members: CommunityMemberEntity[];

        @OneToMany(() => CommunityRoomEntity, room => room.community)
        rooms: CommunityRoomEntity[];

        @Column()
        report_amount: number;

        @OneToMany(() => ReportEntity, report => report.reportCommu)
        reports: ReportEntity[];
}