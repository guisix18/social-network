import { Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsDto } from './dto/posts.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { select } from 'src/utils/posts/select.posts';
import { PostsLikedsDto } from './dto/postsLikeds.dto';

@Injectable()
export class PostsServices {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(dto: PostsDto, user: UserFromJwt): Promise<PostsDto> {
    const data: Prisma.PostCreateInput = {
      id: randomUUID(),
      content: dto.content,
      imageUrl: dto.imageUrl && dto.imageUrl,
      user: { connect: { id: user.id } },
    };

    const post = await this.prisma.post.create({
      data,
    });

    return post;
  }

  async listPosts(): Promise<PostsDto[]> {
    const posts = await this.prisma.post.findMany({
      select,
    });

    return posts;
  }

  async listOnePost(postId: string): Promise<PostsDto> {
    return await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
  }

  async likedPost(
    postId: string,
    user: UserFromJwt,
    checked: boolean,
  ): Promise<PostsLikedsDto> {
    console.log(checked);

    const findLike = await this.prisma.postLikeds.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (findLike) {
      if (!checked) {
        return await this.prisma.postLikeds.update({
          where: {
            id: findLike.id,
          },
          data: {
            liked: false,
          },
        });
      }
      return await this.prisma.postLikeds.update({
        where: {
          id: findLike.id,
        },
        data: {
          liked: true,
        },
      });
    }

    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

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

  async countLikes(postId: string): Promise<number> {
    const count = await this.prisma.postLikeds.count({
      where: {
        postId,
        liked: true,
      },
    });

    return count;
  }
}
