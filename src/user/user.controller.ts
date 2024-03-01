import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserServices } from './user.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import {
  CREATED_USER,
  USER_ACTIVATED,
  USER_DEACTIVATED,
} from 'src/utils/user/messages.user';
import { UserRows } from './dto/userRows.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CacheManagementService } from 'src/cache/cache.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userServices: UserServices,
    @Inject(CacheManagementService)
    private readonly cacheManagement: CacheManagementService,
  ) {}

  @IsPublic()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() data: UserDto,
    @Res() response: Response,
  ): Promise<Response<UserDto>> {
    const user = await this.userServices.createUser(data);

    return response.json({
      message: CREATED_USER,
      row: user,
    });
  }

  @IsPublic()
  @Get()
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @Res() response: Response,
    @Query('test') test: string,
  ): Promise<Response<UserRows>> {
    const users = await this.userServices.listUsers();

    console.log(await this.cacheManagement.getSession(test));

    return response.json(users);
  }

  @Patch('/update/:userId')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Body() data: UpdateUserDto,
    @Param('userId') userId: string,
    @Res() response: Response,
  ): Promise<Response<UserDto>> {
    const updatedUser = await this.userServices.updateUser(data, userId);

    return response.json(updatedUser);
  }

  @Patch('/deactivate/:userId')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(
    @Param('userId') userId: string,
    @Res() response: Response,
  ): Promise<Response<string>> {
    const deactivatedUserId = await this.userServices.deactivateUser(userId);

    return response.json({
      message: USER_DEACTIVATED,
      userId: deactivatedUserId,
    });
  }

  @Patch('activate/:userId')
  @HttpCode(HttpStatus.OK)
  async activateUser(
    @Param('userId') userId: string,
    @Res() response: Response,
  ): Promise<Response<string>> {
    const activatedUserId = await this.userServices.activateUser(userId);

    return response.json({
      message: USER_ACTIVATED,
      userId: activatedUserId,
    });
  }
}
