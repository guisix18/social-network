import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Patch,
  Param,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PostsDto } from './dto/posts.dto';
import { PostsServices } from './posts.service';
import { FiltersPostDto } from './dto/filters-post.dto';
import { PostsLikedsDto } from './dto/postsLikeds.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsServices: PostsServices) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() data: PostsDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<PostsDto> {
    return await this.postsServices.createPost(data, user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listPosts(): Promise<PostsDto[]> {
    return await this.postsServices.listPosts();
  }

  @Get('/:postId')
  @HttpCode(HttpStatus.OK)
  async listOnePost(@Param() filters: FiltersPostDto) {
    return await this.postsServices.listOnePost(filters);
  }

  @Patch('/like')
  @HttpCode(HttpStatus.OK)
  async likedPost(
    @Query() filters: FiltersPostDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<PostsLikedsDto> {
    return await this.postsServices.likedPost(filters, user);
  }

  @Get('/count/likes')
  @HttpCode(HttpStatus.OK)
  async countLikes(@Query() filters: FiltersPostDto) {
    return await this.postsServices.countLikes(filters);
  }
}
