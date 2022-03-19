import { Injectable } from "@nestjs/common";
import { RepliesRepository } from "src/repository/replies.repository";

@Injectable()
export class RepliesService {
    constructor(private readonly repository: RepliesRepository) {}

    async replyComment(commentID, author, body, incognito) {
        const favorited = 0;
        const date = new Date();

        await this.repository.replyComment(commentID, author, body, incognito, favorited, date, date);
    }

    async favoriteReply(replyID) {
        await this.repository.favoriteReply(replyID);
    }

    async unfavoriteReply(replyID) {
        await this.repository.unfavoriteReply(replyID);
    }

    async updateReply(replyID, body, incognito) {
        const update_date = new Date();

        await this.repository.updateReply(replyID, body, incognito, update_date);
    }
}