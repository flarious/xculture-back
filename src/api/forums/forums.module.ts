import { Module } from "@nestjs/common";
import { RepositoryModule } from "src/repository/repository.module";
import { ForumsController } from "./forums.controller";
import { ForumsService } from "./forums.service";

@Module({
    imports : [RepositoryModule],
    controllers: [ForumsController],
    providers: [ForumsService],
})
export class ForumsModule {}