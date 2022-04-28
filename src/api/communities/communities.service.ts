import { Injectable } from "@nestjs/common";
import { CommunitiesRepository } from "src/repository/communities.repository";

@Injectable()
export class CommunitiesService {
    constructor(private readonly repository: CommunitiesRepository) {}

    async findAll() {
        return await this.repository.findAll();
    }

    async findOne(communityID) {
        communityID = communityID.split("_")[1];

        return await this.repository.findOne(communityID);
    }

    async insert(name, owner, short_description, description, thumbnail, type, questions) {
        const member_amount = 0;
        const date = new Date()
        const report_amount = 0;

        return await this.repository.insert(name, owner, short_description, description, thumbnail, member_amount, date, report_amount, type, questions);
    }

    async update(communityID, name, short_description, description, thumbnail, type, questions) {
        communityID = communityID.split("_")[1];

        return await this.repository.update(communityID, name, short_description, description, thumbnail, type, questions);
    }

    async joinCommunity(communityID, member) {
        communityID = communityID.split("_")[1];

        return await this.repository.joinCommunity(communityID, member);
    }

    async acceptMember(communityID, member) {
        communityID = communityID.split("_")[1];

        await this.repository.acceptMember(communityID, member);
    }

    async declineMember(communityID, member) {
        communityID = communityID.split("_")[1];

        await this.repository.declineMember(communityID, member);
    }

    async unjoinCommunity(communityID, member) {
        communityID = communityID.split("_")[1];

        return await this.repository.unjoinCommunity(communityID, member);
    }

    async deleteCommunity(communityID) {
        communityID = communityID.split("_")[1];

        await this.repository.deleteCommu(communityID);
    }
}