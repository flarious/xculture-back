import { Controller, Put, Post, Param, Body, Req } from "@nestjs/common";
import { Request } from "express";
import { RepliesService } from "./replies.service";

@Controller("/forums/:forumID/comments/:commentID/replies")
export class RepliesController {
    constructor(private readonly service: RepliesService) {}

    @Post()
    async replyComment (
        @Req() request: Request,
        @Param("commentID") commentID: number,
        @Body("content") body: string,
        @Body("incognito") incognito: boolean
    ) {
        await this.service.replyComment(commentID, request['user'].id, body, incognito);
    }

    @Put("/:replyID")
    async editReply (
        @Param("replyID") replyID: number,
        @Body("content") body: string,
        @Body("incognito") incognito: boolean,
    ) {
        await this.service.updateReply(replyID, body, incognito);
    }

    @Put("/:replyID/favorite")
    async favoriteReply(
        @Req() request: Request,
        @Param('replyID') replyID: number,
    ) {
        await this.service.favoriteReply(replyID, request['user'].id);
    }

    @Put("/:replyID/unfavorite")
    async unfavoriteReply (
        @Req() request: Request,
        @Param('replyID') replyID: number,
    ) {
        await this.service.unfavoriteReply(replyID, request['user'].id);
    }
}