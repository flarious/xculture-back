import { Injectable } from "@nestjs/common";
import { AdminRepository } from "src/repository/admin.repository";

@Injectable()
export class AdminService {
    constructor(private readonly repository: AdminRepository) {}

    static async checkAdmin(uid) {
        return await AdminRepository.checkAdmin(uid);
    }

    async findAllForums() {
        return await this.repository.findAllForums();
    }

    async findAllEvents() {
        return await this.repository.findAllEvents();
    }

    async findAllCommus() {
        return await this.repository.findAllCommus();
    }

    async findAllUsers() {
        return await this.repository.findAllUsers();
    }

    async findAllReported() {
        return await this.repository.findAllReported();
    }

    async findAllStat() {
        return await this.repository.findAllStat();
    }

    async findAllForumsStat() {
        return await this.repository.findAllForumsStat();
    }

    async findAllCommusStat() {
        return await this.repository.findAllCommusStat();
    }

    async findAllEventsStat() {
        return await this.repository.findAllEventsStat();
    }

    async findAllReportedStat() {
        return await this.repository.findAllReportedStat();
    }

    async findAllForumsGraph() {
        return await this.repository.findAllForumsGraph();
    }

    async findAllEventsGraph() {
        return await this.repository.findAllEventsGraph();
    }

    async findAllCommusGraph() {
        return await this.repository.findAllCommusGraph();
    }

    async findAllReportedGraph() {
        return await this.repository.findAllReportedGraph();
    }

    async findOneReportedForum(id) {
        id = id.split("_")[1];

        return await this.repository.findOneReportedForum(id)
    }

    async findOneReportedEvent(id) {
        id = id.split("_")[1];

        return await this.repository.findOneReportedEvent(id)
    }

    async findOneReportedCommunity(id) {
        id = id.split("_")[1];

        return await this.repository.findOneReportedCommunity(id)
    }

    async findAllOneReportedDetail(id) {
        const type = id.split("_")[0];
        id = id.split("_")[1];

        return await this.repository.findAllOneReportedDetail(type, id);
    }

    async deleteForumAndBan(id) {
        id = id.split("_")[1];

        await this.repository.deleteForumAndBan(id);
    }
    
    async deleteEventAndBan(id) {
        id = id.split("_")[1];

        await this.repository.deleteEventAndBan(id);
    }

    async deleteCommuAndBan(id) {
        id = id.split("_")[1];

        await this.repository.deleteCommuAndBan(id);
    }

    async deleteRejectedReports(id) {
        const type = id.split("_")[0];
        id = id.split("_")[1];

        await this.repository.deleteRejectedReports(type, id);
    }

    async unban(id) {
        await this.repository.unban(id);
    }
}