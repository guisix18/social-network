import { HttpException, Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportResDto, ReporterDto } from './dto/reporter.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserServices } from 'src/user/user.service';

@Injectable()
export class ReporterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userServices: UserServices,
  ) {}

  async createReport(
    dto: ReporterDto,
    user: UserFromJwt,
    blockedId: string,
  ): Promise<ReportResDto> {
    const findReported = await this.prisma.blockedUsers.findFirst({
      where: {
        reporterId: user.id,
        blockedUserId: blockedId,
      },
    });

    if (findReported)
      throw new HttpException('You already report this user', 400);

    const verify = await this.verifySituation(blockedId);

    if (verify)
      throw new HttpException('User blocked due to excessive reporting', 400);

    const data: Prisma.BlockedUsersCreateInput = {
      id: randomUUID(),
      reason: dto.reason,
      blockedUser: { connect: { id: blockedId } },
      reporterUser: { connect: { id: user.id } },
    };

    const proceedWithBlock = await this.prisma.blockedUsers.create({ data });

    return proceedWithBlock;
  }

  private async verifySituation(blockedId: string): Promise<string> {
    const ocurrences = await this.prisma.blockedUsers.count({
      where: {
        blockedUserId: blockedId,
      },
    });

    if (ocurrences < 3) return;

    return await this.userServices.deactivateUser(blockedId);
  }
}
