import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response, response } from 'express';
import { UserServices } from './user.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

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

    return response.json(user);
  }

  @IsPublic()
  @Get()
  @HttpCode(HttpStatus.OK)
  async listUsers(@Res() response: Response): Promise<Response<UserDto[]>> {
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
}
