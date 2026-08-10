import { api } from "./api";

export interface Post {
  _id: string;
  title: string;
  content: unknown;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category?: string;
  tags: string[];
  summary?: string;
  coverImage?: string;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsResponse {
  totalPosts: number;
  page: number;
  limit: number;
  totalPages: number;
  posts: Post[];
}

export const getPosts = async (
  page = 1,
  limit = 5,
): Promise<GetPostsResponse> => {
  const response = await api.get<GetPostsResponse>("/posts", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};