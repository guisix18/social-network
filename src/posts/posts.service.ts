import { Injectable, NotFoundException } from '@nestjs/common';
import { UserFromJwt } from '../auth/models/UserFromJwt';
import { PrismaService } from '../prisma/prisma.service';
import { PostsDto } from './dto/posts.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PostsLikedsDto } from './dto/postsLikeds.dto';
import { PrismaPostRepository } from '../repositories/prisma/prisma.post.repository';
import { FiltersPostDto } from './dto/filters-post.dto';
import { POST_NOT_FOUND } from 'src/utils/posts/exceptions.posts';

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

  async listOnePost(filters: FiltersPostDto): Promise<PostsDto> {
    const { postId } = filters;

    return this.postRepository.listOnePost(postId);
  }

  async likedPost(
    filters: FiltersPostDto,
    user: UserFromJwt,
  ): Promise<PostsLikedsDto> {
    const { postId, likeId } = filters;

    if (!likeId) {
      const post = await this.postRepository.listOnePost(postId);

      if (!post) throw new NotFoundException(POST_NOT_FOUND);

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

    const history = await this.prisma.postLikeds.findFirst({
      where: {
        id: likeId,
        userId: user.id,
        postId,
      },
    });

    if (!history) throw new NotFoundException('We do not found a history');

    const likedStatus = !history.liked;
    return await this.prisma.postLikeds.update({
      where: {
        id: likeId,
      },
      data: {
        liked: likedStatus,
      },
    });
  }

  async countLikes(filters: FiltersPostDto): Promise<number> {
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
