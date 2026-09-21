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

export type SortByOption = 'newest' | 'oldest' | 'most_liked' | 'trending';

export const getPosts = async (
  page = 1,
  limit = 6,
  sortBy: SortByOption = 'newest',
  author?: string,
  status?: string
): Promise<GetPostsResponse> => {
  const response = await api.get<GetPostsResponse>("/posts", {
    params: {
      page,
      limit,
      sortBy,
      ...(author ? { author } : {}),
      ...(status ? { status } : {}),
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

export type UpdatePostRequest = Partial<CreatePostRequest>;

export const updatePost = async (
  id: string,
  data: UpdatePostRequest
): Promise<Post> => {
  const response = await api.patch<Post>(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/posts/${id}`);
  return response.data;
};

export const searchPosts = async (
  keyword: string,
  page = 1,
  limit = 10
): Promise<GetPostsResponse> => {
  const response = await api.get<GetPostsResponse>('/posts/search', {
    params: { keyword, page, limit },
  });
  return response.data;
};
