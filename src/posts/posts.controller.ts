import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request, Response, response } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PostsDto } from './dto/posts.dto';
import { PostsServices } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsServices: PostsServices) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() data: PostsDto,
    @CurrentUser() user: UserFromJwt,
    @Res() response: Response,
  ): Promise<Response<PostsDto>> {
    const post = await this.postsServices.createPost(data, user);

    return response.json(post);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listPosts(@Res() response: Response): Promise<Response<PostsDto[]>> {
    const posts = await this.postsServices.listPosts();

    return response.json(posts);
  }
}
