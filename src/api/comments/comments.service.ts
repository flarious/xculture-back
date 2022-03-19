import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "src/repository/comments.repository";

@Injectable()
export class CommentsService {
    constructor(private readonly repository: CommentsRepository) {}

    async commentForum(forumID, author, body, incognito) {
        const favorited = 0;
        const replied = 0;
        const date = new Date();
        
        await this.repository.commentForum(forumID, author, body, incognito, favorited, replied, date, date);
    }

    async favoriteComment(commentID) {
        await this.repository.favoriteComment(commentID);
    }

    async unfavoriteComment(commentID) {
        await this.repository.unfavoriteComment(commentID);
    }

    async updateComment(commentID, body, incognito) {
        const update_date = new Date();

        await this.repository.updateComment(commentID, body, incognito, update_date);
    }
}