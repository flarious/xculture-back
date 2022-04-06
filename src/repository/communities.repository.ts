import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { CommunityRoomEntity } from "src/entity/community/communityRoom.entity";
import { MessageEntity } from "src/entity/message/message.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
import { ReportRepository } from "./report.repository";

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
            .select("communityMember.id")
            .where("communityMember.member = :member_id", {member_id: member})
            .andWhere("communityMember.community = :community_id", {community_id: communityID})
            .getOne();
    

        await this.connection.createQueryBuilder()
            .delete()
            .from(CommunityMemberEntity)
            .where("community = :community", {community : communityID})
            .andWhere("member = :member", {member : member})
            .where("id = :id", {id: communityMember.id})
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

    async deleteCommu(id) {
        const reportRepository = new ReportRepository(this.connection);
        reportRepository.deleteReport("community", id);

        // Get community detail to delete
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "community")
        .leftJoin("community.owner", "owner")
        .leftJoin("community.members", "members")
        .leftJoin("members.member", "communityMember")
        .leftJoin("community.rooms", "rooms")
        .leftJoin("rooms.messages", "messages")
        .leftJoin("messages.repliedTo", "repliedTo")
        .leftJoin("messages.sender", "sender")
        .select([
            "community.id",
            "owner.id", 
            "members.id", 
            "communityMember.id",
            "rooms.id",
            "messages.id",
            "repliedTo.id",
            "sender.id"
        ])
        .where("community.id = :id", {id: id})
        .getOne();
        
        for (const room of commu.rooms) {
            for (const message of room.messages) {
                await this.connection.createQueryBuilder()
                .relation(UserEntity, "userMessages")
                .of(message.sender)
                .remove(message);

                await this.connection.createQueryBuilder()
                .relation(MessageEntity, "repliedBy")
                .of(message.repliedTo)
                .remove(message);
            }

            await this.connection.createQueryBuilder()
            .delete()
            .from(MessageEntity)
            .where("room = :id", {id: room.id})
            .execute();
        }
        
        for (const member of commu.members) {
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "memberCommunities")
            .of(member.member)
            .remove(member)
        }

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userCommunities")
        .of(commu.owner)
        .remove(commu);

        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityRoomEntity)
        .where("community = :id", {id: commu.id})
        .execute();

        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityMemberEntity)
        .where("community = :id", {id: commu.id})
        .execute();
        console.log("Delete Member");
        
        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityEntity)
        .where("id = :id", {id: commu.id})
        .execute();
        console.log("Delete Commu");

        return commu.owner.id;
    }
}