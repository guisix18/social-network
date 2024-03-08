import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserServices } from './user.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import {
  CREATED_USER,
  USER_ACTIVATED,
  USER_DEACTIVATED,
} from 'src/utils/user/messages.user';
import { UserRows } from './dto/userRows.dto';
import { ForgetPasswordDto } from './dto/send-reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { FilterNewPasswordDto } from './dto/filter-new-password.dto';
import { CacheInterceptor } from 'src/cache/cache.interceptor';

@Controller('user')
export class UserController {
  constructor(private readonly userServices: UserServices) {}

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

  @UseInterceptors(CacheInterceptor)
  @Get()
  @HttpCode(HttpStatus.OK)
  async listUsers(@Res() response: Response): Promise<Response<UserRows>> {
    const users = await this.userServices.listUsers();

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

  @IsPublic()
  @Post('/send-reset-password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(
    @Body() data: ForgetPasswordDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response<void>> {
    await this.userServices.forgetPassword(request, data);

    return response.json({
      message: 'Email sent, please verify your email',
    });
  }

  @IsPublic()
  @Patch('/new-password')
  async newPassword(
    @Body() data: NewPasswordDto,
    @Res() response: Response,
    @Query() filters: FilterNewPasswordDto,
  ) {
    console.log(filters);
    await this.userServices.newPassword(data, filters);

    return response.json({
      message: 'Password changed!',
    });
  }
}
