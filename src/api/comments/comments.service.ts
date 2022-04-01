import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "src/repository/comments.repository";

@Injectable()
export class CommentsService {
    constructor(private readonly repository: CommentsRepository) {}

    async commentForum(forumID, author, body, incognito) {
        const favorited = 0;
        const replied = 0;
        const date = new Date();
        forumID = forumID.split("_")[1];
        
        await this.repository.commentForum(forumID, author, body, incognito, favorited, replied, date, date);
    }

    async favoriteComment(commentID, user) {
        await this.repository.favoriteComment(commentID, user);
    }

    async unfavoriteComment(commentID, user) {
        await this.repository.unfavoriteComment(commentID, user);
    }

    async updateComment(commentID, body, incognito) {
        const update_date = new Date();

        await this.repository.updateComment(commentID, body, incognito, update_date);
    }
}