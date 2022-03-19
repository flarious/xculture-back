import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { CommunitiesController } from "./communities.controller";
import { CommunitiesService } from "./communities.service";

@Module({
    imports: [RepositoryModule],
    controllers: [CommunitiesController],
    providers: [CommunitiesService],
})
export class CommunitiesModule{}