import { Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("/admins")
export class AdminController {
    constructor(private readonly service: AdminService) {}

    @Get("/forums")
    async findAllReportedForum() {
        return await this.service.findAllReportedForum();
    }

    @Get("/events")
    async findAllReportedEvent() {
        return await this.service.findAllReportedEvent();
    }

    @Get("/communities")
    async findAllReportedCommunity() {
        return await this.service.findAllReportedCommunity();
    }

    @Get("/forums/:id")
    async findOneReportedForum(
        @Param("id") id: string
    ) {
        return await this.service.findOneReportedForum(id);
    }

    @Get("/events/:id")
    async findOneReportedEvent(
        @Param("id") id: string
    ) {
        return await this.service.findOneReportedEvent(id);
    }

    @Get("/communities/:id")
    async findOneReportedCommunity(
        @Param("id") id: string
    ) {
        return await this.service.findOneReportedCommunity(id);
    }

    @Put(":id")
    async ban(
        @Param("id") id: string
    ) {
        await this.service.ban(id);
    }

    @Delete(":id")
    async delete(
        @Param("id") id: string
    ) {
        await this.service.delete(id);
    }
}