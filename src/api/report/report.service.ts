import { Injectable } from '@nestjs/common';
import { ReportRepository } from 'src/repository/report.repository';

@Injectable()
export class ReportService {
    constructor(private readonly repository: ReportRepository) {}

    async findAllReportCategory() {
        return this.repository.findAllReportCategory();
    }

    async report(id, topics, detail, reporter) {
        const now = new Date();
        const splitted = id.split("_");
        const reportedType = splitted[0];
        const reportedId = splitted[1];

        await this.repository.report(reportedId, topics, detail, reportedType, now, now, reporter);
    }
}
