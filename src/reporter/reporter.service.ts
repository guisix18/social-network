import { HttpException, Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReporterDto } from './dto/reporter.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserServices } from 'src/user/user.service';
import {
  ALREADY_REPORTED,
  USER_BLOCKED,
} from 'src/utils/reports/exceptions.reports';
import { Cron, CronExpression } from '@nestjs/schedule';

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
  ): Promise<ReporterDto> {
    const findReported = await this.prisma.blockedUsers.findFirst({
      where: {
        reporterId: user.id,
        blockedUserId: blockedId,
      },
    });

    if (findReported) throw new HttpException(ALREADY_REPORTED, 400);

    const verify = await this.verifySituation(blockedId);

    if (verify) throw new HttpException(USER_BLOCKED, 400);

    const data: Prisma.BlockedUsersCreateInput = {
      id: randomUUID(),
      reason: dto.reason,
      blockedUser: { connect: { id: blockedId } },
      reporterUser: { connect: { id: user.id } },
    };

    const proceedWithBlock = await this.prisma.blockedUsers.create({ data });

    return proceedWithBlock;
  }

  async getReports(): Promise<ReporterDto[]> {
    return await this.prisma.blockedUsers.findMany();
  }

  private async verifySituation(blockedId: string): Promise<string> {
    const block = true;

    const ocurrences = await this.prisma.blockedUsers.count({
      where: {
        blockedUserId: blockedId,
      },
    });

    if (ocurrences < 3) return;

    return await this.userServices.deactivateUser(blockedId, block);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  private async verifyBlockedAtTime(): Promise<void> {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    const users = await this.userServices.listUsers();

    const firstBlocked = users.rows.find((user) => !user.active);

    if (!firstBlocked) return;

    const userBlocked = await this.prisma.user.findFirst({
      where: {
        blockedAt: firstBlocked.blockedAt,
      },
    });

    const timeDifference = now - new Date(userBlocked.blockedAt).getTime();

    await this.prisma.$transaction(
      async (prismaTsx: Prisma.TransactionClient) => {
        if (timeDifference < oneHour) return;

        await this.userServices.activateUser(userBlocked.id);

        await prismaTsx.blockedUsers.deleteMany({
          where: {
            blockedUserId: userBlocked.id,
          },
        });

        return;
      },
    );
  }
}
