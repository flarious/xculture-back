import { Injectable } from "@nestjs/common";
import { ForumsRepository } from "src/repository/forums.repository";

@Injectable()
export class ForumsService {
    constructor(private readonly repository: ForumsRepository) {}

    async getForums() {
        return await this.repository.getForums();
    }

    async getForum(forumID) {
        forumID = forumID.split("_")[1];

        return await this.repository.getForum(forumID);
    }

    async createForum(title, subtitle, author, content, thumbnail_url, incognito, tags) {
        const favorite_amount = 0;
        const viewed = 0;
        const date = new Date();
        const report_amount = 0;

        await this.repository.createForum(title, subtitle, author, content, thumbnail_url, incognito, tags, viewed, favorite_amount, date, date, report_amount);
    }

    async updateForum(forumID, title, subtitle, content, thumbnail_url, incognito, tags) {
        const update_date = new Date();
        forumID = forumID.split("_")[1];

        await this.repository.updateForum(forumID, title, subtitle, content, thumbnail_url, incognito, tags, update_date);
    }

    async updateForumView(forumID) {
        forumID = forumID.split("_")[1];

        await this.repository.updateForumView(forumID);
    }

    async forumFavorite(forumID) {
        forumID = forumID.split("_")[1];

        await this.repository.forumFavorite(forumID);
    }

    async forumUnfavorite(forumID) {
        forumID = forumID.split("_")[1];

        await this.repository.forumUnfavorite(forumID);
    }
}