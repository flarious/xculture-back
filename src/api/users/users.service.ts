import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/repository/users.repository";

@Injectable()
export class UsersService {
    constructor(private readonly repository: UserRepository) {}

    async findOne(uid: string) {
        return await this.repository.findOne(uid);
    }

    async insert(uid: string, email: string, name: string) {
        const profile_pic = "";
        const bio = "";
        const banned_amount = 0;

        return await this.repository.insert(uid, email, name, profile_pic, bio, banned_amount);
    }

    async update(uid: string, name: string, profile_pic: string, bio: string, tags) {
        return await this.repository.update(uid, name, profile_pic, bio, tags);
    }

    async getUserForums(uid: string) {
        return await this.repository.getUserForums(uid);
    }

    async getUserFavoritedForums(uid: string) {
        return await this.repository.getUserFavoritedForums(uid);
    }

    async getUserEvents(uid: string) {
        return await this.repository.getUserEvents(uid);
    }

    async getUserInterestedEvents(uid: string) {
        return await this.repository.getUserInterestedEvents(uid);
    }

    async getUserCommunities(uid: string) {
        return await this.repository.getUserCommunities(uid);
    }

    async getUserJoinedCommunities(uid: string) {
        return await this.repository.getUserJoinedCommunities(uid);
    }

    async banExpired(uid) {
        await this.repository.banExpired(uid);
    }
}