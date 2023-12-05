import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  Patch,
} from '@nestjs/common';

import { Response, response } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PostsDto } from './dto/posts.dto';
import { PostsServices } from './posts.service';
import { FiltersPostFeedbacksDto } from './dto/filtersPostsFeedback.dto';

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

  @Patch('/like')
  @HttpCode(HttpStatus.OK)
  async likedPost(
    @Query('postId') postId: string,
    @CurrentUser() user: UserFromJwt,
    @Res() response: Response,
  ): Promise<Response<number>> {
    const likes = await this.postsServices.likedPost(postId, user);

    return response.json({
      id: likes,
    });
  }

  @Get('/count/likes')
  @HttpCode(HttpStatus.OK)
  async countLikes(
    @Query() filters: FiltersPostFeedbacksDto,
    @CurrentUser() user: UserFromJwt,
    @Res() response: Response,
  ) {
    const { postId } = filters;
    const count = await this.postsServices.countLikes(postId, user);

    return response.json({ count: count });
  }
}
