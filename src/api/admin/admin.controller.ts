import { Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("/admins")
export class AdminController {
    constructor(private readonly service: AdminService) {}

    @Get("/forums")
    async findAllForums() {
        return await this.service.findAllForums();
    }

    @Get("/events")
    async findAllEvents() {
        return await this.service.findAllEvents();
    }

    @Get("/communities")
    async findAllCommus() {
        return await this.service.findAllCommus();
    }

    @Get("/users")
    async findAllUsers() {
        return await this.service.findAllUsers();
    }

    @Get("/reported")
    async findAllReported() {
        return await this.service.findAllReported();
    }

    @Get("/stat")
    async findAllStat() {
        return await this.service.findAllStat();
    }

    @Get("/forums/stat")
    async findAllForumsStat() {
        return await this.service.findAllForumsStat();
    }

    @Get("/communities/stat")
    async findAllCommusStat() {
        return await this.service.findAllCommusStat();
    }

    @Get("/events/stat")
    async findAllEventsStat() {
        return await this.service.findAllEventsStat();
    }

    @Get("/reported/stat")
    async findAllReportedStat() {
        return await this.service.findAllReportedStat();
    }

    @Get("/forums/graph")
    async findAllForumsGraph() {
        return await this.service.findAllForumsGraph();
    }

    @Get("/events/graph")
    async findAllEventGraph() {
        return await this.service.findAllEventsGraph();
    }

    @Get("/communities/graph")
    async findAllCommusGraph() {
        return await this.service.findAllCommusGraph();
    }

    @Get("/reported/graph")
    async findAllReportedGraph() {
        return await this.service.findAllReportedGraph();
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

    @Get("reported/:id")
    async findAllOneReportedDetail(
        @Param("id") id: string
    ) {
        return await this.service.findAllOneReportedDetail(id);
    }

    @Put("users/:id/unban")
    async unban(
        @Param("id") id: string
    ) {
        await this.service.unban(id);
    }

    @Delete("forums/:id")
    async deleteForumAndBan(
        @Param("id") id: string
    ) {
        await this.service.deleteForumAndBan(id);
    }

    @Delete("events/:id")
    async deleteEventAndBan(
        @Param("id") id: string
    ) {
        await this.service.deleteEventAndBan(id);
    }

    @Delete("communities/:id")
    async deleteCommuAndBan(
        @Param("id") id: string
    ) {
        await this.service.deleteCommuAndBan(id);
    }

    @Delete("reported/:id")
    async deleteRejectedReports(
        @Param("id") id: string
    ) {
        await this.service.deleteRejectedReports(id);
    }
}