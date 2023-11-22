import { Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsDto } from './dto/posts.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { select } from 'src/utils/posts/select.posts';

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
      select: {
        id: true,
        content: true,
        imageFormat: true,
        imageUrl: true,
        userId: true,
        comments: true,
      },
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
}
