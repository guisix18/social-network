import { Injectable } from '@nestjs/common';
import { UserFromJwt } from '../auth/models/UserFromJwt';
import { PrismaService } from '../prisma/prisma.service';
import { PostsDto } from './dto/posts.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PostsLikedsDto } from './dto/postsLikeds.dto';
import { PrismaPostRepository } from '../repositories/prisma/prisma.post.repository';
import { FiltersPostFeedbacksDto } from './dto/filtersPostsFeedback.dto';

@Injectable()
export class PostsServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postRepository: PrismaPostRepository,
  ) {}

  async createPost(dto: PostsDto, user: UserFromJwt): Promise<PostsDto> {
    return this.postRepository.createPost(dto, user);
  }

  async listPosts(): Promise<PostsDto[]> {
    return this.postRepository.listPosts();
  }

  async listOnePost(postId: string): Promise<PostsDto> {
    return this.postRepository.listOnePost(postId);
  }

  async likedPost(
    filters: FiltersPostFeedbacksDto,
    user: UserFromJwt,
  ): Promise<PostsLikedsDto> {
    const { postId, likeId } = filters;

    const history = await this.prisma.postLikeds.findUnique({
      where: {
        id: likeId,
        userId: user.id,
        postId,
      },
    });

    if (!likeId && !history) {
      const post = await this.postRepository.listOnePost(postId);

      const data: Prisma.PostLikedsCreateInput = {
        id: randomUUID(),
        eventAt: new Date(),
        liked: true,
        user: { connect: { id: user.id } },
        post: { connect: { id: post.id } },
      };

      const likedPost = await this.prisma.postLikeds.create({
        data,
      });

      return likedPost;
    }

    if (history) {
      const likedStatus = !history.liked;
      return await this.prisma.postLikeds.update({
        where: {
          id: history.id,
        },
        data: {
          liked: likedStatus,
        },
      });
    }
  }

  async countLikes(filters: FiltersPostFeedbacksDto): Promise<number> {
    const { postId } = filters;

    const count = await this.prisma.postLikeds.count({
      where: {
        postId,
        liked: true,
      },
    });

    return count;
  }
}
