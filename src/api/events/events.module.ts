import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
    imports: [RepositoryModule],
    controllers: [EventsController],
    providers: [EventsService],
})
export class EventsModule {}