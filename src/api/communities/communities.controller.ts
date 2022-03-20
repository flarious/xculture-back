import { Body, Controller, Get, Param, Post, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { CommunitiesService } from "./communities.service";

@Controller("/communities")
export class CommunitiesController {
    constructor(private readonly service: CommunitiesService) {}

    @Get()
    async getCommunitiesAllCategories () {
        return await this.service.findAll();
    }

    @Get("/:communityID")
    async getCommunityDetail (
        @Param("communityID") communityID: string,
    ) {
        return await this.service.findOne(communityID);
    }

    @Post("")
    async createCommunity (
        @Req() request: Request,
        @Body("name") name: string,
        @Body("short_description") short_description: string,
        @Body("description") description: string,
        @Body("thumbnail") thumbnail: string,
    ) {
        return await this.service.insert(name, request['user'].id, short_description, description, thumbnail);
    }

    @Put("/:communityID")
    async updateCommunity (
        @Param("communityID") communityID: string,
        @Body("name") name: string,
        @Body("short_description") short_description: string,
        @Body("description") description: string,
        @Body("thumbnail") thumbnail: string,
    ) {
        return await this.service.update(communityID, name, short_description, description, thumbnail);
    }

    @Put("/:communityID/join")
    async joinCommunity (
        @Param("communityID") communityID: string,
        @Req() request: Request
    ) {
        return await this.service.joinCommunity(communityID, request['user'].id);
    }

    @Put("/:communityID/unjoin")
    async unjoinCommunity (
        @Param("communityID") communityID: string,
        @Req() request: Request
    ) {
        return await this.service.unjoinCommunity(communityID, request['user'].id);
    }

    /*

    @Put("/:communityID/changeVisibility")
    async changeVisibility () {

    }

    @Get("/:communityID/report")
    async getReportDetail () {

    }

    @Post("/:communityID/report")
    async reportCommunity () {

    }

    // +---+ Filtering member +---+ 
    @Get("/:communityID/questions")
    async getCommunityQuestions() {

    }

    @Put("/:communityID/report")
    async saveUserAnswer() {

    }

    @Get("/:communityID/members/:memberID")
    async getUsersAnswer() {

    }

    @Put("/:communityID/members/:memberID")
    async acceptMember() {

    }

    @Delete("/:communityID/members/:memberID")
    async rejectMember() {
        
    }

    // +---+ Member +---+ 
    @Get("/:communityID/members")
    async getListOfMember () {

    }
    */
}