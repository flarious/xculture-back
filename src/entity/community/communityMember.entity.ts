import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { CommunityEntity } from "./community.entity";

@Entity("community_member")
export class CommunityMemberEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ["pending", "member"],
        default: "pending"
    })
    type: string;

    @ManyToOne(() => CommunityEntity, community => community.members)
    community: CommunityEntity;

    @ManyToOne(() => UserEntity, user => user.memberCommunities)
    member: UserEntity;
}