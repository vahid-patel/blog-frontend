import { api } from './api';

export type VoteType = 'UPVOTE' | 'DOWNVOTE';

export interface VoteResponse {
  message: string;
  vote: VoteType | null;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
}

export interface MyVoteResponse {
  vote: VoteType | null;
}

export const votePost = async (
  postId: string,
  type: VoteType
): Promise<VoteResponse> => {
  const response = await api.post<VoteResponse>(`/votes/posts/${postId}`, {
    type,
  });
  return response.data;
};

export const getMyPostVote = async (
  postId: string
): Promise<MyVoteResponse> => {
  const response = await api.get<MyVoteResponse>(`/votes/posts/${postId}/me`);
  return response.data;
};

export const voteComment = async (
  commentId: string,
  type: VoteType
): Promise<VoteResponse> => {
  const response = await api.post<VoteResponse>(`/votes/comments/${commentId}`, {
    type,
  });
  return response.data;
};

export const getMyCommentVote = async (
  commentId: string
): Promise<MyVoteResponse> => {
  const response = await api.get<MyVoteResponse>(
    `/votes/comments/${commentId}/me`
  );
  return response.data;
};
