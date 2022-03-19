import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
    imports: [RepositoryModule],
    controllers: [TagsController],
    providers: [TagsService],
})
export class TagsModule {}