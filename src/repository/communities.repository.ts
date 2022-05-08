import { Injectable } from "@nestjs/common";
import { CommunityEntity } from "src/entity/community/community.entity";
import { CommunityMemberEntity } from "src/entity/community/communityMember.entity";
import { CommunityRoomEntity } from "src/entity/community/communityRoom.entity";
import { MessageEntity } from "src/entity/message/message.entity";
import { QuestionEntity } from "src/entity/question/question.entity";
import { MutualCommunityEntity } from "src/entity/users/mutualCommunity.entity";
import { UserEntity } from "src/entity/users/user.entity";
import { Connection } from "typeorm";
import { AnswerRepository } from "./answers.repository";
import { QuestionRepository } from "./questions.repository";
import { ReportRepository } from "./report.repository";
import { UserRepository } from "./users.repository";

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
            .leftJoin("community.questions", "questions")
            .select([
                "community", 
                "owner.id", "owner.name", "owner.profile_pic", 
                "members", 
                "member.id", "member.name", "member.profile_pic",
                "questions"
            ])
            .where("community.id = :id", {id: communityID})
            .getOne();

        commu.id = "community_" + commu.id;

        return commu;
    }

    async insert(name, owner, shortdesc, desc, thumbnail, member_amount, date, report_amount, type, questions) {
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
                    create_date: date,
                    update_date: date,
                    report_amount: report_amount,
                    type: type
                }
            ])
            .execute();

        const newCommunityID = insertResult.identifiers[0].id;
        
        await this.connection.createQueryBuilder()
            .relation(UserEntity, "userCommunities")
            .of(owner)
            .add(newCommunityID);

        await this.joinCommunity(newCommunityID, owner);

        if (type == "private") {
            const questionRepository = new QuestionRepository(this.connection);
            questionRepository.create(newCommunityID, questions);
        }
        
    }

    async update(communityID, name, shortdesc, desc, thumbnail, type, questions) {
        await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set(
                {
                    name: name,
                    shortdesc: shortdesc,
                    desc: desc,
                    thumbnail: thumbnail,
                    type: type,
                    update_date: new Date(),
                }
            )
            .where("community_id = :id", {id: communityID})
            .execute();


        const questionRepository = new QuestionRepository(this.connection);

        if (type == "private") {
            questionRepository.update(communityID, questions);
        }
        else if (type == "public") {
            questionRepository.delete(communityID);
        }
        
    }

    async joinCommunity(communityID, member) {
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "community")
        .leftJoin("community.owner", "owner")
        .select(["community.id", "community.type", "owner.id"])
        .where("community.id = :id", {id: communityID})
        .getOne();        

        const type = (commu.type == "private" && member != commu.owner.id) ? "pending" : "member";

        if (type == "member") {
            await this.connection.createQueryBuilder()
            .update(CommunityEntity)
            .set(
                {
                    member_amount: () => "member_amount + 1"
                }
            )
            .where("community_id = :id", {id: communityID})
            .execute();

            this.mutualMember(communityID, member);
        }

        const insertResult = await this.connection.createQueryBuilder()
            .insert()
            .into(CommunityMemberEntity)
            .values({
                type: type
            })
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

    async acceptMember(communityID, member) {
        await this.connection.createQueryBuilder()
        .update(CommunityMemberEntity)
        .set({
            type: "member",
        })
        .where("community = :communityID", {communityID: communityID})
        .andWhere("member = :memberID", {memberID: member})
        .andWhere("type = :pending", {pending: "pending"})
        .execute();

        await this.connection.createQueryBuilder()
        .update(CommunityEntity)
        .set(
            {
                member_amount: () => "member_amount + 1"
            }
        )
        .where("community_id = :id", {id: communityID})
        .execute();

        this.mutualMember(communityID, member);

        const answerRepository = new AnswerRepository(this.connection);
        answerRepository.deleteUserAnswer(communityID, member);
    }

    
    async declineMember(communityID, member) {
        const communityMember = await this.connection.createQueryBuilder(CommunityMemberEntity, "communityMember")
            .select("communityMember.id")
            .where("communityMember.member = :member_id", {member_id: member})
            .andWhere("communityMember.community = :community_id", {community_id: communityID})
            .andWhere("communityMember.type = :pending", {pending: "pending"})
            .getOne();

        const answerRepository = new AnswerRepository(this.connection);
        await answerRepository.deleteUserAnswer(communityID, member);

        await this.connection.createQueryBuilder()
            .delete()
            .from(CommunityMemberEntity)
            .where("community = :community", {community : communityID})
            .andWhere("member = :member", {member : member})
            .andWhere("id = :id", {id: communityMember.id})
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

    async mutualMember(communityId, newMember) {
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "commu")
        .leftJoin("commu.members", "members")
        .leftJoin("members.member", "member")
        .select(["commu.id", "members.id", "member.id"])
        .where("commu.id = :id", {id: communityId})
        .getOne();

        
        const userRepository = new UserRepository(this.connection);

        const newMemberMutuals = await userRepository.findOneMutualsCommunities(newMember);
        const newMemberMutualsList = newMemberMutuals.MutualCommunitiesWith.map(mutual => mutual.to.id);

        const membersMutualsList = [];

        for (const member of commu.members) {
            const memberMutuals = await userRepository.findOneMutualsCommunities(member.member.id);
            membersMutualsList.push(memberMutuals.MutualCommunitiesWith.map(mutual => mutual.to.id))
        }

        for (const member of commu.members) {
            if (newMemberMutualsList.includes(member.member.id)) {
                await this.connection.createQueryBuilder()
                .update(MutualCommunityEntity)
                .set({
                    numberOfMutualCommunities: () => "numberOfMutualCommunities + 1"
                })
                .where("from = :id", {id: newMember})
                .andWhere("to = :userId", {userId: member.member.id})
                .execute();
            }
            else {
                newMemberMutualsList.push(member.member.id);

                const newMutual = await this.connection.createQueryBuilder()
                .insert()
                .into(MutualCommunityEntity)
                .values({
                    numberOfMutualCommunities: 1
                })
                .execute()

                const newMutualId = newMutual.identifiers[0].id;

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualCommunitiesWith")
                .of(newMember)
                .add(newMutualId);

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualCommunitiesTo")
                .of(member.member.id)
                .add(newMutualId);
            }
        }

        for (const member of commu.members) {
            const memberIndex = commu.members.indexOf(member);
            if (membersMutualsList[memberIndex].includes(newMember)) {
                await this.connection.createQueryBuilder()
                .update(MutualCommunityEntity)
                .set({
                    numberOfMutualCommunities: () => "numberOfMutualCommunities + 1"
                })
                .where("from = :id", {id: member.member.id})
                .andWhere("to = :userId", {userId: newMember})
                .execute();
            }
            else {
                membersMutualsList[memberIndex].push(newMember)

                const newMutual = await this.connection.createQueryBuilder()
                .insert()
                .into(MutualCommunityEntity)
                .values({
                    numberOfMutualCommunities: 1
                })
                .execute()

                const newMutualId = newMutual.identifiers[0].id;

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualCommunitiesWith")
                .of(member.member.id)
                .add(newMutualId);

                await this.connection.createQueryBuilder()
                .relation(UserEntity, "MutualCommunitiesTo")
                .of(newMember)
                .add(newMutualId);
            }
        }
    }

    async unMutualMember(communityId, leavingMember) {
        const commu = await this.connection.createQueryBuilder(CommunityEntity, "commu")
        .leftJoin("commu.members", "members")
        .leftJoin("members.member", "member")
        .select(["commu.id", "members.id", "member.id"])
        .where("commu.id = :id", {id: communityId})
        .getOne();

        for (const member of commu.members) {
            if (member.member.id != leavingMember) {
                await this.connection.createQueryBuilder()
                    .update(MutualCommunityEntity)
                    .set({
                        numberOfMutualCommunities: () => "numberOfMutualCommunities - 1"
                    })
                    .where("from = :id", {id: leavingMember})
                    .andWhere("to = :userId", {userId: member.member.id})
                    .execute();

                const mutual = await this.connection.createQueryBuilder(MutualCommunityEntity, "mutual")
                .where("mutual.from = :id", {id: leavingMember})
                .andWhere("mutual.to = :userId", {userId: member.member.id})
                .getOne();

                console.log(mutual);

                if (mutual.numberOfMutualCommunities == 0) {
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(MutualCommunityEntity)
                    .where("from = :id", {id: leavingMember})
                    .andWhere("to = :userId", {userId: member.member.id})
                    .execute();

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualCommunitiesWith")
                    .of(leavingMember)
                    .remove(mutual.id);

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualCommunitiesTo")
                    .of(member.member.id)
                    .remove(mutual.id);
                }
            }
        }

        for (const member of commu.members) {
            if (member.member.id != leavingMember) {
                await this.connection.createQueryBuilder()
                    .update(MutualCommunityEntity)
                    .set({
                        numberOfMutualCommunities: () => "numberOfMutualCommunities - 1"
                    })
                    .where("from = :id", {id: member.member.id})
                    .andWhere("to = :userId", {userId: leavingMember})
                    .execute();

                const mutual = await this.connection.createQueryBuilder(MutualCommunityEntity, "mutual")
                .where("mutual.from = :id", {id: member.member.id})
                .andWhere("mutual.to = :userId", {userId: leavingMember})
                .getOne();

                if (mutual.numberOfMutualCommunities == 0) {
                    await this.connection.createQueryBuilder()
                    .delete()
                    .from(MutualCommunityEntity)
                    .where("from = :id", {id: member.member.id})
                    .andWhere("to = :userId", {userId: leavingMember})
                    .execute();

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualCommunitiesWith")
                    .of(member.member.id)
                    .remove(mutual.id);

                    await this.connection.createQueryBuilder()
                    .relation(UserEntity, "MutualCommunitiesTo")
                    .of(leavingMember)
                    .remove(mutual.id);
                }
            }
        }
    }

    async getCommunitiesRecommended(userId) {
        const userRepository = new UserRepository(this.connection);
        const user = await userRepository.findOneMutualsCommunities(userId);

        let recommendedCommunities; 
        
        if (user.MutualCommunitiesWith.length) {
            const mutualWith = user.MutualCommunitiesWith.map(mutual => mutual.to.id);

            const joinedCommunities = await userRepository.getUserJoinedCommunities(userId);
            const joined = await joinedCommunities.map(joined => joined.id.split("_")[1]);

            recommendedCommunities = await this.connection.createQueryBuilder(CommunityEntity, "commus")
            .leftJoin("commus.owner", "owner")
            .leftJoin("commus.members", "members")
            .leftJoin("members.member", "member")
            .select([
                "commus", 
                "owner.id", "owner.name", "owner.profile_pic",
                "members", 
                "member.id", "member.name", "member.profile_pic"
            ])
            .where("commus.id not in (:...joined)", {joined: joined})
            .andWhere("member.id in (:...mutualMembers)", {mutualMembers: mutualWith})
            .getMany();

            for (const community of recommendedCommunities) {
                community.id = "community_" + community.id;
            }
        }
        else {
            recommendedCommunities = this.findAll();
        }
        
        return recommendedCommunities;
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

        this.unMutualMember(communityID, member);
        
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
            .andWhere("id = :id", {id: communityMember.id})
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

        const mutualMembers = await this.connection.createQueryBuilder(MutualCommunityEntity, "mutuals")
        .leftJoin("mutuals.from", "from")
        .leftJoin("mutuals.to", "to")
        .select(["mutuals", "from.id", "to.id"])
        .getMany();
        
        for (const mutual of mutualMembers) {
            await this.connection.createQueryBuilder()
            .relation(UserEntity, "MutualCommunitiesWith")
            .of(mutual.from.id)
            .remove(mutual.id);

            await this.connection.createQueryBuilder()
            .relation(UserEntity, "MutualCommunitiesTo")
            .of(mutual.to.id)
            .remove(mutual.id);
        }

        await this.connection.createQueryBuilder()
        .delete()
        .from(MutualCommunityEntity)
        .execute();
        
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

        const questionRepository = new QuestionRepository(this.connection);
        questionRepository.delete(commu.id);

        await this.connection.createQueryBuilder()
        .relation(UserEntity, "userCommunities")
        .of(commu.owner)
        .remove(commu);

        await this.connection.createQueryBuilder()
        .delete()
        .from(QuestionEntity)
        .where("community = :id", {id: commu.id})
        .execute();

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
        
        await this.connection.createQueryBuilder()
        .delete()
        .from(CommunityEntity)
        .where("id = :id", {id: commu.id})
        .execute();

        return commu.owner.id;
    }
}