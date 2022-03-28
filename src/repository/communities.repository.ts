import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";

@Injectable()
export class CommunitiesRepository {
    constructor(private readonly connection: Connection) {}

    async findAll() {
        const commus = await this.connection.createQueryBuilder(CommunityEntity, "communities")
            .leftJoin("communities.owner", "owner")
            .select([
                "communities", 
                "owner.id", "owner.name", "owner.profile_pic"
            ])
            .getMany();

        for (const commu of commus) {
            commu.id = "community_" + commu.id
        }

        return commus;
    }

    async findOne(communityID) {
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "community")
            .leftJoin("community.owner", "owner")
            .leftJoin("community.members", "members")
            .leftJoin("members.member", "member")
            .select([
                "community", 
                "owner.id", "owner.name", "owner.profile_pic", 
                "members", 
                "member.id", "member.name", "member.profile_pic"
            ])
            .where("community.id = :id", {id: communityID})
            .getOne();

        commu.id = "community_" + commu.id;

        return commu;
    }

    async insert(name, owner, shortdesc, desc, thumbnail, member_amount, date, report_amount) {
        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(CommunityEntity)
            .values([
                {
                    name: name,
                    shortdesc: shortdesc,
                    desc: desc,
                    thumbnail: thumbnail,
                    member_amount: member_amount,
                    date: date,
                    report_amount: report_amount
                }
            ])
            .execute();

        const newCommunityID = insertResult.identifiers[0].id;
        
        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userCommunities")
            .of(owner)
            .add(newCommunityID);

        await this.joinCommunity(newCommunityID, owner);
    }

    async update(communityID, name, shortdesc, desc, thumbnail) {
        await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set(
                {
                    name: name,
                    shortdesc: shortdesc,
                    desc: desc,
                    thumbnail: thumbnail
                }
            )
            .where("community_id = :id", {id: communityID})
            .execute();
    }

    async joinCommunity(communityID, member) {
        await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set(
                {
                    member_amount: () => "member_amount + 1"
                }
            )
            .where("community_id = :id", {id: communityID})
            .execute();

        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(CommunityMemberEntity)
            .values({})
            .execute();

        const newCommunityMemberID = insertResult.identifiers[0].id

        await this.connection.createQueryBuilder()
            .relation(CommunityEntity, "members")
            .of(communityID)
            .add(newCommunityMemberID)

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberCommunities")
            .of(member)
            .add(newCommunityMemberID)
    }

    async unjoinCommunity(communityID, member) {
        await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set(
                {
                    member_amount: () => "member_amount - 1"
                }
            )
            .where("community_id = :id", {id : communityID})
            .execute();

        
        const communityMember = await this.connection.createQueryBuilder(CommunityMemberEntity, "communityMember")
                .where("communityMember.member = :id", {id: member})
                .getOne();

        await this.connection.createQueryBuilder()
            .delete()
            .from(CommunityMemberEntity)
            .where("community = :community", {community : communityID})
            .andWhere("member = :member", {member : member})
            .execute();

        await this.connection.createQueryBuilder()
            .relation(CommunityEntity, "members")
            .of(communityID)
            .remove(communityMember.id)

        await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberCommunities")
            .of(member)
            .remove(communityMember.id)
    }
}