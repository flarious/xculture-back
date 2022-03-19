import { Controller, Get, Post, Put } from "@nestjs/common";
import { TagsService } from "./tags.service";

@Controller("/tags")
export class TagsController {
    constructor(private readonly service: TagsService) {}

    @Get()
    async getTags() {
        return await this.service.getTags();
    }

    @Put()
    async selectTags() {
        /*
        Update user data with tags
        */
    }

    @Post()
    async createTag() {
        /*
        Create new tag from body
        */
    }

}