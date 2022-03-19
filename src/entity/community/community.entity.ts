import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { CommunityMemberEntity } from './communityMember.entity';


@Entity('community')              // create a table name events
export class CommunityEntity {
    
        @PrimaryGeneratedColumn({ name: "community_id" })
        id: number;


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


        // @Column({ name: "report_amount" })
        // amount: number;


        // @Column({ name: "owner_id" })
        // id: number;


        // @Column({ name: "member_id" })
        // id: number;


}