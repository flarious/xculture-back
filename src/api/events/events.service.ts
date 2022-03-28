import { Injectable } from "@nestjs/common";
import { EventsRepository } from "src/repository/events.repository";

@Injectable()
export class EventsService {
    constructor(private readonly repository: EventsRepository) {}
    
    async findAll() {
        return await this.repository.findAll();
    }

    async findOne(eventID) {
        eventID = eventID.split("_")[1];

        return await this.repository.findOne(eventID);
    }

    async insert(name, host, body, thumbnail, location, date: string) {
        const interested_amount = 0;
        const temp = date.split('/').reverse();
        const eventDate = new Date(parseInt(temp[0]), parseInt(temp[1]) - 1, parseInt(temp[2]));
        const report_amount = 0;

        await this.repository.insert(name, host, body, thumbnail, location, interested_amount, eventDate, report_amount);
    }

    async update(eventID, name, body, thumbnail, location, date) {
        const temp = date.split('/').reverse();
        const eventDate = new Date(parseInt(temp[0]), parseInt(temp[1]) - 1, parseInt(temp[2]));
        eventID = eventID.split("_")[1];
        
        await this.repository.update(eventID, name, body, thumbnail, location, eventDate);
    }

    async join(eventID, member) {
        eventID = eventID.split("_")[1];
        
        await this.repository.join(eventID, member);
    }

    async unjoin(eventID, member) {
        eventID = eventID.split("_")[1];

        await this.repository.unjoin(eventID, member);
    }
}