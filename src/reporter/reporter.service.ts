import { HttpException, Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportResDto, ReporterDto } from './dto/reporter.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class ReporterService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    dto: ReporterDto,
    user: UserFromJwt,
    blockedId: string,
  ): Promise<ReportResDto> {
    const findBlocks = await this.prisma.blockedUsers.findFirst({
      where: {
        reporterId: user.id,
        blockedUserId: blockedId,
      },
    });

    console.log('Achou?', findBlocks);

    if (findBlocks)
      throw new HttpException('You already report this user', 400);

    const count = await this.countReports(blockedId);

    console.log(count);

    if (count >= 3) throw new HttpException('User already blocked', 400);

    const data: Prisma.BlockedUsersCreateInput = {
      id: randomUUID(),
      reason: dto.reason,
      blockedUser: { connect: { id: blockedId } },
      reporterUser: { connect: { id: user.id } },
    };

    const proceedWithBlock = await this.prisma.blockedUsers.create({ data });

    console.log('PROCEED', proceedWithBlock);

    return proceedWithBlock;
  }

  private async countReports(blockedId: string): Promise<number> {
    const count = await this.prisma.blockedUsers.count({
      where: {
        blockedUserId: blockedId,
      },
    });

    return count;
  }
}
