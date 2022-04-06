import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { ForumsService } from "./forums.service";

/* http.get(//10.0.2.2:3000/forums) */
@Controller("/forums")
export class ForumsController {
    constructor(private readonly service: ForumsService) {}

    /* Get all forums for home page */
    @Get()
    async getForumsAllCategories() {
        return await this.service.getForums();
    }

    /* Get a forum's detail */
    @Get("/:forumID")
    async getForum(@Param("forumID") forumID: number) {
        return await this.service.getForum(forumID);
    }

    @Post("")
    async createForum(
        @Req() request: Request,
        @Body('title') title: string,
        @Body('subtitle') subtitle: string,
        @Body('content') content: string,
        @Body('thumbnail') thumbnail: string,
        @Body('incognito') incognito: boolean,
        @Body('tags') tags: number[],
    ) {
        await this.service.createForum(title, subtitle, request['user'].id, content, thumbnail, incognito, tags);
    }
    
    @Put("/:forumID")
    async updateForum(
        @Param("forumID") forumID: number,
        @Body("title") title: string,
        @Body('subtitle') subtitle: string,
        @Body('content') content: string,
        @Body('thumbnail') thumbnail: string,
        @Body('incognito') incognito: boolean,
        @Body('tags') tags: string[],
    ) {
        await this.service.updateForum(forumID, title, subtitle, content, thumbnail, incognito, tags);
    }

    @Put("/:forumID/favorite")
    async favoriteForum(
        @Req() request: Request,
        @Param("forumID") forumID: number
    ) {
        await this.service.forumFavorite(forumID, request['user'].id);
    }

    @Put("/:forumID/unfavorite")
    async unfavoriteForum(
        @Req() request: Request,
        @Param("forumID") forumID: number
    ) {
        await this.service.forumUnfavorite(forumID, request['user'].id);
    }

    @Put("/:forumID/viewed")
    async viewForum(
        @Param("forumID") forumID: number,
    ) {
        await this.service.updateForumView(forumID);
    }

    @Delete("/:forumID")
    async deleteForum(
        @Param("forumID") forumID: string,
    ) {
        await this.service.deleteForum(forumID);
    }

}