import { Injectable } from "@nestjs/common";
import { AdminRepository } from "src/repository/admin.repository";

@Injectable()
export class AdminService {
    constructor(private readonly repository: AdminRepository) {}

    static async checkAdmin(uid) {
        return await AdminRepository.checkAdmin(uid);
    }

    async findAllReportedForum() {
        return await this.repository.findAllReportedForum()
    }

    async findAllReportedEvent() {
        return await this.repository.findAllReportedEvent()
    }

    async findAllReportedCommunity() {
        return await this.repository.findAllReportedCommunity()
    }

    async findOneReportedForum(id) {
        return await this.repository.findOneReportedForum(id)
    }

    async findOneReportedEvent(id) {
        return await this.repository.findOneReportedEvent(id)
    }

    async findOneReportedCommunity(id) {
        return await this.repository.findOneReportedCommunity(id)
    }

    /*
    async ban(id) {
        await this.repository.ban(id);
    }
    */

    async delete(id) {
        await this.repository.delete(id);
    }

}