import { api } from './api';

export interface CommentAuthor {
  _id: string;
  name: string;
  email: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: CommentAuthor;
  content: string;
  parentComment?: string | null;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetCommentsResponse {
  totalComments: number;
  page: number;
  limit: number;
  totalPages: number;
  comments: Comment[];
}

export interface GetRepliesResponse {
  totalReplies: number;
  page: number;
  limit: number;
  totalPages: number;
  replies: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentComment?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export const getPostComments = async (
  postId: string,
  page = 1,
  limit = 20
): Promise<GetCommentsResponse> => {
  const response = await api.get<GetCommentsResponse>(
    `/posts/${postId}/comments`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

export const getCommentReplies = async (
  commentId: string,
  page = 1,
  limit = 20
): Promise<GetRepliesResponse> => {
  const response = await api.get<GetRepliesResponse>(
    `/comments/${commentId}/replies`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

export const createComment = async (
  postId: string,
  data: CreateCommentRequest
): Promise<Comment> => {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, data);
  return response.data;
};

export const updateComment = async (
  commentId: string,
  data: UpdateCommentRequest
): Promise<Comment> => {
  const response = await api.patch<Comment>(`/comments/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (
  commentId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/comments/${commentId}`
  );
  return response.data;
};
