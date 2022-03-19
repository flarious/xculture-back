import { Injectable } from "@nestjs/common";
import { TagsRepository } from "src/repository/tags.repository";

@Injectable()
export class TagsService {
    constructor(private readonly repository: TagsRepository) {}

    async getTags() {
        return await this.repository.getTags();
    }

}