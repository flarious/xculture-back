import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";

@Entity("mutual_community")
export class MutualCommunityEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numberOfMutualCommunities: number;

    @ManyToOne(() => UserEntity, user => user.MutualCommunitiesWith)
    from: UserEntity;

    @ManyToOne(() => UserEntity, user => user.MutualCommunitiesTo)
    to: UserEntity;
}