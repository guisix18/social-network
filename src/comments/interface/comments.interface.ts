import { CommentsDto } from '../dto/comments.dto';

export interface IComments {
  id: string;
  text: string;
  userId: string;
  postId: string;
  parentId: string;
  children: any;
}
