import { Injectable, NotFoundException } from '@nestjs/common';
import { UserFromJwt } from '../auth/models/UserFromJwt';
import { PrismaService } from '../prisma/prisma.service';
import { PostsDto } from './dto/posts.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PostsLikedsDto } from './dto/postsLikeds.dto';
import { PrismaPostRepository } from '../repositories/prisma/prisma.post.repository';
import { FiltersPostDto } from './dto/filters-post.dto';
import {
  HISTORY_NOT_FOUND,
  POST_NOT_FOUND,
} from 'src/utils/posts/exceptions.posts';
import { Posts } from './interfaces/posts.interface';

@Injectable()
export class PostsServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postRepository: PrismaPostRepository,
  ) {}

  async createPost(dto: PostsDto, user: UserFromJwt): Promise<PostsDto> {
    return this.postRepository.createPost(dto, user);
  }

  async listPosts(): Promise<Posts[]> {
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

    if (!history) throw new NotFoundException(HISTORY_NOT_FOUND);

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

  //Esse serviço provavelmente é inútil
  //Agora tem utilidade, sei lá, quando o usuário for olhar o perfil dele e ver quantas curtidas ele já deu como todo(só de posts até então)
  //Mas o interessante seria rodar isso no profile né? Para não ter que chamar o banco duas vezes. Na verdade, melhor ainda, disparar as duas ao mesmo tempo pois uma não tem relação com a outra
  async countLikes(user: UserFromJwt): Promise<number> {
    const count = await this.prisma.postLikeds.count({
      where: {
        userId: user.id,
        liked: true,
      },
    });

    return count;
  }
}
