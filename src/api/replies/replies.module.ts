import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { RepliesController } from "./replies.controller";
import { RepliesService } from "./replies.service";

@Module({
    imports: [RepositoryModule],
    controllers: [RepliesController],
    providers: [RepliesService],
})
export class RepliesModule {}