import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReporterService } from './reporter.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { ReporterDto } from './dto/reporter.dto';

@Controller('report')
export class ReporterController {
  constructor(private readonly reporterServices: ReporterService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createReport(
    @Body() data: any,
    @Res() response: Response,
    @Query('userId') blockedId: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<Response<ReporterDto>> {
    const report = await this.reporterServices.createReport(
      data,
      user,
      blockedId,
    );

    return response.json(report);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getReports(
    @Res() response: Response,
  ): Promise<Response<ReporterDto[]>> {
    const reports = await this.reporterServices.getReports();

    return response.json(reports);
  }
}
