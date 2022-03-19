import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
    imports: [RepositoryModule],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
