import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserServices } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userServices: UserServices) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() data: UserDto,
    @Res() response: Response,
  ): Promise<Response<UserDto>> {
    const user = await this.userServices.createUser(data);

    return response.json(user);
  }
}
