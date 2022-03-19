import { Controller, Put, Post, Param, Body, Req } from "@nestjs/common";
import { Request } from "express";
import { RepliesService } from "./replies.service";

@Controller("/forums/:forumID/comments/:commentID/replies")
export class RepliesController {
    constructor(private readonly service: RepliesService) {}

    @Post()
    async replyComment (
        @Param("commentID") commentID: number,
        @Req() request: Request,
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
        @Param('replyID') replyID: number,
    ) {
        await this.service.favoriteReply(replyID);
    }

    @Put("/:replyID/unfavorite")
    async unfavoriteReply (
        @Param('replyID') replyID: number,
    ) {
        await this.service.unfavoriteReply(replyID);
    }
}