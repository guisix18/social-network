import { UserFromJwt } from '../../auth/models/UserFromJwt';
import { PostsDto } from '../../posts/dto/posts.dto';
import { PostRepository } from '../posts/prisma.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { POST_NOT_FOUND } from '../../utils/posts/exceptions.posts';
import { Posts } from 'src/posts/interfaces/posts.interface';

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(dto: PostsDto, user: UserFromJwt): Promise<PostsDto> {
    const data: Prisma.PostCreateInput = {
      id: randomUUID(),
      content: dto.content,
      imageUrl: dto.imageUrl && dto.imageUrl,
      user: { connect: { id: user.id } },
    };

    const post = this.prisma.post.create({
      data,
    });

    return post;
  }

  async listPosts(): Promise<Posts[]> {
    const posts = await this.prisma.post.findMany({
      select: {
        id: true,
        content: true,
        imageUrl: true,
        _count: {
          select: {
            comments: true,
            postsLikeds: {
              where: {
                liked: true,
              },
            },
          },
        },
      },
    });

    const postWithLikes = posts.map((post) => ({
      ...post,
      likes: post._count.postsLikeds,
      comments: post._count.comments,
      _count: undefined,
    }));

    return postWithLikes;
  }

  async listOnePost(postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new NotFoundException(POST_NOT_FOUND);

    return post;
  }
}
