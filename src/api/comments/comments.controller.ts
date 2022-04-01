import { Body, Controller, Param, Post, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { CommentsService } from "./comments.service";

@Controller("/forums/:forumID/comments")
export class CommentsController {
    constructor(private readonly service: CommentsService) {}

    @Post()
    async commentForum (
        @Param("forumID") forumID: number,
        @Req() request: Request,
        @Body("content") body: string,
        @Body("incognito") incognito: boolean
    ) {
        await this.service.commentForum(forumID, request['user'].id, body, incognito);
    }

    
    @Put("/:commentID")
    async editComment (
        @Param("commentID") commentID: number,
        @Body("content") body: string,
        @Body("incognito") incognito: boolean,
    ) {
        await this.service.updateComment(commentID, body, incognito);
    }
    
    @Put("/:commentID/favorite")
    async favoriteComment(
        @Req() request: Request,
        @Param("commentID") commentID: number
    ) {
        await this.service.favoriteComment(commentID, request['user'].id);
    }

    @Put("/:commentID/unfavorite")
    async unfavoriteComment (
        @Req() request: Request,
        @Param("commentID") commentID: number
    ) {
        await this.service.unfavoriteComment(commentID, request['user'].id);
    }
    
}