import { Controller, Get } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("/admins")
export class AdminController {
    constructor(private readonly service: AdminService) {}

    /* Need to change Path because the flow of work changed */ 
}