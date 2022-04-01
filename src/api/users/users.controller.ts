import { Body, Controller, Get, Post, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "./users.service";

@Controller("/user")
export class UsersController {
    constructor(private readonly service: UsersService) {}

    @Get()
    async getUserProfile (
        @Req() request: Request
    ) {
        return await this.service.findOne(request['user'].id);
    }

    @Post()
    async addUserProfile (
        @Req() request: Request,
        @Body("name") name: string
    ) {
        await this.service.insert(request['user'].id, request['user'].email, name)
    }

    @Put()
    async updateUserProfile (
        @Req() request: Request,
        @Body("name") name: string,
        @Body("profile_pic") profile_pic: string,
        @Body("bio") bio: string,
        @Body("tags") tags: string[],
    ) {
        await this.service.update(request['user'].id, name, profile_pic, bio, tags);
    }

    @Get("/forums")
    async getUserForums (
        @Req() request: Request,
    ) {
        return await this.service.getUserForums(request['user'].id);
    }

    @Get("/forums/favorites")
    async getUserFavoritedForums(
        @Req() request: Request,
    ) {
        return await this.service.getUserFavoritedForums(request['user'].id);
    }

    @Get("/events")
    async getUserEvents (
        @Req() request: Request,
    ) {
        return await this.service.getUserEvents(request['user'].id);
    }

    @Get("/events/interested")
    async getUserInterestedEvents(
        @Req() request: Request,
    ) {
        return await this.service.getUserInterestedEvents(request['user'].id);
    }

    @Get("/communities")
    async getUserCommunities (
        @Req() request: Request,
    ) {
        return await this.service.getUserCommunities(request['user'].id);
    }

    @Get("/communities/joined")
    async getUserJoinedCommunities (
        @Req() request: Request,
    ) {
        return await this.service.getUserJoinedCommunities(request['user'].id);
    }

    @Put("/unban")
    async banExpired (
        @Req() request: Request,
    ) {
        await this.service.banExpired(request['user'].id);
    }

/*
    @Get("/setting")
    async getUserSetting () {

    }

    @Put("/setting")
    async updateUserSetting () {

    }

    @Put("/password/change")
    async changePassword () {

    }

    @Put("/password/reset")
    async resetPassword () {

    }
*/
    
    /* For forgetPassword, Let client generate a verification code and sent to user's email might be better */

}