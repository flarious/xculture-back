import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { EventsService } from "./events.service";

@Controller("/events")
export class EventsController {
    constructor(private readonly service: EventsService) {}

    @Get()
    async getEventsAllCategories() {
        return await this.service.findAll();
    }

    @Get("/recommendation")
    async getEventsRecommended(
        @Req() request: Request
    ) {
        return await this.service.getEventsRecommended(request['user'].id);
    }

    @Get("/:eventID")
    async getEvent(
        @Param("eventID") eventID: number
    ) {
        return await this.service.findOne(eventID);
    }

    @Post()
    async createEvent(
        @Req() request: Request,
        @Body("name") name: string,
        @Body("body") body: string,
        @Body("thumbnail") thumbnail: string,
        @Body("location") location: string,
        @Body("date") date: string,
    ) {
        await this.service.insert(name, request['user'].id, body, thumbnail, location, date);
    }

    @Put("/:eventID")
    async updateEvent(
        @Param("eventID") eventID: string,
        @Body("name") name: string,
        @Body("body") body: string,
        @Body("thumbnail") thumbnail: string,
        @Body("location") location: string,
        @Body("date") date: string,
    ) {
        await this.service.update(eventID, name, body, thumbnail, location, date);
    }

    @Put("/:eventID/join")
    async joinEvent(
        @Param("eventID") eventID: string,
        @Req() request: Request
    ) {
        await this.service.join(eventID, request['user'].id);
    }

    @Put("/:eventID/unjoin")
    async unjoinEvent(
        @Param("eventID") eventID: string,
        @Req() request: Request
    ) {
        await this.service.unjoin(eventID, request['user'].id);
    }

    @Delete("/:eventID")
    async deleteEvent(
        @Param("eventID") eventID: string,
    ) {
        await this.service.deleteEvent(eventID);
    }

    /*
    @Get("/:eventID/report")
    async getReportDetail() {
        
    }
    
    @Put("/:eventID/report")
    async reportEvent(@Param("eventID") eventID: number) {
        
    }
    */
}