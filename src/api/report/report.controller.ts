import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get("")
  findAllReportCategory() {
    return this.reportService.findAllReportCategory();
  }
  
  @Post(":id")
  report(
    @Req() request: Request,
    @Param("id") id: string,
    @Body("topics") topics: number[],
    @Body("detail") detail: string,
  ) {
    this.reportService.report(id, topics, detail, request['user'].id);
  }
}
