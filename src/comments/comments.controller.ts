import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CommentsServices } from './comments.service';
import { Response, response } from 'express';
import { CommentsDto } from './dto/comments.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { FiltersCommentsDto } from './dto/filtersComments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsServices: CommentsServices) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postingComments(
    @Body() data: CommentsDto,
    @CurrentUser() user: UserFromJwt,
    @Query('postId') postId: string,
    @Res() response: Response,
  ): Promise<Response<CommentsDto>> {
    const reply = await this.commentsServices.postingComments(
      data,
      user,
      postId,
    );

    return response.json(reply);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listComments(
    @Res() response: Response,
  ): Promise<Response<CommentsDto[]>> {
    const comments = await this.commentsServices.listComments();

    return response.json(comments);
  }

  @Post('/reply')
  @HttpCode(HttpStatus.CREATED)
  async replyingComments(
    @Body() data: CommentsDto,
    @CurrentUser() user: UserFromJwt,
    @Query() filters: FiltersCommentsDto,
    @Res() response: Response,
  ): Promise<Response<CommentsDto>> {
    const reply = await this.commentsServices.replyingComments(
      data,
      filters,
      user,
    );

    return response.json(reply);
  }

  @Get('/byPost')
  @HttpCode(HttpStatus.OK)
  async getCommentsByPost(
    @Query('postId') postId: string,
    @Res() response: Response,
  ): Promise<Response<CommentsDto>> {
    const commentsByPost = await this.commentsServices.getCommentsByPost(
      postId,
    );

    return response.json(commentsByPost);
  }

  @Get('/count/:postId')
  @HttpCode(HttpStatus.OK)
  async countCommentsByPost(
    @Param('postId') postId: string,
    @Res() response: Response,
  ): Promise<Response<number>> {
    const countComments = await this.commentsServices.countCommentsByPost(
      postId,
    );

    return response.json({
      count: countComments,
    });
  }
}
