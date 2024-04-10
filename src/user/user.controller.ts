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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserServices } from './user.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { USER_ACTIVATED, USER_DEACTIVATED } from 'src/utils/user/messages.user';
import { UserRows } from './dto/userRows.dto';
import { ForgetPasswordDto } from './dto/send-reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { FilterNewPasswordDto } from './dto/filter-new-password.dto';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecordWithId } from './dto/record-with-id.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userServices: UserServices) {}

  @IsPublic()
  @Post()
  @ApiCreatedResponse({
    description:
      'Containing the user identificatio and the email will be set to the informed sender(verify account)',
  })
  @ApiConflictResponse({ description: 'Already exists user with this email' })
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() data: UserDto,
    @Req() request: Request,
  ): Promise<RecordWithId> {
    return await this.userServices.createUser(data, request);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access_token')
  @ApiOkResponse({ description: 'List all users or return a empty structure' })
  async listUsers(): Promise<UserRows> {
    return await this.userServices.listUsers();
  }

  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access_token')
  @ApiOkResponse({
    description: 'Listing profile with some information for a specific user',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async userProfile(@CurrentUser() user: UserFromJwt) {
    return await this.userServices.userProfile(user.id);
  }

  @Patch('/update/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Uptade user informations' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOkResponse({ description: 'Deactivate user' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOkResponse({ description: 'Activate user' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOkResponse({
    description:
      'When everything is ok, the email will be sent to the informed sender',
  })
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
  @ApiOkResponse({
    description: 'When the JWT is the expected, the passowrd will be changed',
  })
  async newPassword(
    @Body() data: NewPasswordDto,
    @Res() response: Response,
    @Query() filters: FilterNewPasswordDto,
  ) {
    await this.userServices.newPassword(data, filters);

    return response.json({
      message: 'Password changed!',
    });
  }

  @IsPublic()
  @Get('/verify-user')
  @ApiOkResponse({
    description:
      'When the verification ID is the expected, your account will be validated',
  })
  async verifyUserAccount(
    @Res() response: Response,
    @Query('verificationId') verificationId: string,
  ) {
    await this.userServices.verifyUserAccount(verificationId);

    return response.json({
      message: 'Your account has been validated!',
    });
  }
}
