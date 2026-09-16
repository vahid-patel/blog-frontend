import { api } from "./api";
import type { JSONContent } from "@tiptap/core";

export interface Post {
  _id: string;
  title: string;
  content: JSONContent;
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

export interface CreatePostRequest {
  title: string;
  content: JSONContent;
  category?: string;
  tags?: string[];
  summary?: string;
  coverImage?: string;
  status?: "DRAFT" | "PUBLISHED";
}

export interface CreatePostResponse {
  _id: string;
  title: string;
  content: JSONContent;
  author: string;
  category: string;
  tags: string[];
  summary?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED";
  upvotesCount: number;
  downvotesCount: number;
  score: number;
  commentsCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const createPost = async (
  data: CreatePostRequest
): Promise<CreatePostResponse> => {
  const response = await api.post<CreatePostResponse>(
    "/posts/create",
    data
  );

  return response.data;
};

export const getPostById = async (
  id: string
): Promise<Post> => {
  const response = await api.get<Post>(`/posts/${id}`);

  return response.data;
};