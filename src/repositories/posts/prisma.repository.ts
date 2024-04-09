import { Post } from '@prisma/client';
import { UserFromJwt } from '../../auth/models/UserFromJwt';
import { PostsDto } from '../../posts/dto/posts.dto';

export abstract class PostRepository {
  abstract createPost(dto: PostsDto, user: UserFromJwt): Promise<PostsDto>;
  abstract listPosts(): Promise<PostsDto[]>;
  abstract listOnePost(postId: string): Promise<Post>;
}

// export interface PostRepository {
//   createPost: (dto: PostsDto, user: UserFromJwt) => Promise<PostsDto>;
//   listPosts: () => Promise<PostsDto[]>;
//   listOnePost: (postId: string) => Promise<Post>;
// }
