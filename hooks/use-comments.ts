'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getPostComments,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
  type CreateCommentRequest,
  type UpdateCommentRequest,
} from '@/services/comments';
import {
  voteComment,
  getMyCommentVote,
  type VoteType,
} from '@/services/votes';
import { useAuthStore } from '@/store/auth-store';

export function usePostComments(postId: string, page = 1) {
  return useQuery({
    queryKey: ['comments', postId, page],
    queryFn: () => getPostComments(postId, page),
    enabled: !!postId,
  });
}

export function useCommentReplies(commentId: string, page = 1, enabled = false) {
  return useQuery({
    queryKey: ['replies', commentId, page],
    queryFn: () => getCommentReplies(commentId, page),
    enabled: !!commentId && enabled,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(postId, data),
    onSuccess: (_, variables) => {
      if (variables.parentComment) {
        queryClient.invalidateQueries({
          queryKey: ['replies', variables.parentComment],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useUpdateComment(postId: string, parentCommentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequest;
    }) => updateComment(commentId, data),
    onSuccess: () => {
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ['replies', parentCommentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}

export function useDeleteComment(postId: string, parentCommentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ['replies', parentCommentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useCommentVote(commentId: string, initialScore: number = 0) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: myVoteData } = useQuery({
    queryKey: ['comment-vote', commentId],
    queryFn: () => getMyCommentVote(commentId),
    enabled: !!commentId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const serverVote = myVoteData?.vote ?? null;

  // Local optimistic state for instant UI response (< 1ms)
  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(serverVote);
  const [optimisticScore, setOptimisticScore] = useState<number>(initialScore);

  useEffect(() => {
    setOptimisticVote(serverVote);
  }, [serverVote]);

  useEffect(() => {
    setOptimisticScore(initialScore);
  }, [initialScore]);

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => voteComment(commentId, type),
    onMutate: async (newVoteType) => {
      await queryClient.cancelQueries({ queryKey: ['comment-vote', commentId] });

      const prevVote = optimisticVote;
      const prevScore = optimisticScore;

      let nextVote: VoteType | null = newVoteType;
      let scoreDelta = 0;

      if (prevVote === newVoteType) {
        nextVote = null;
        scoreDelta = newVoteType === 'UPVOTE' ? -1 : 1;
      } else if (prevVote === 'UPVOTE' && newVoteType === 'DOWNVOTE') {
        scoreDelta = -2;
      } else if (prevVote === 'DOWNVOTE' && newVoteType === 'UPVOTE') {
        scoreDelta = 2;
      } else {
        scoreDelta = newVoteType === 'UPVOTE' ? 1 : -1;
      }

      const nextScore = prevScore + scoreDelta;

      setOptimisticVote(nextVote);
      setOptimisticScore(nextScore);

      queryClient.setQueryData(['comment-vote', commentId], { vote: nextVote });

      return { prevVote, prevScore };
    },
    onError: (_err, _newVoteType, context) => {
      if (context) {
        setOptimisticVote(context.prevVote);
        setOptimisticScore(context.prevScore);
        queryClient.setQueryData(['comment-vote', commentId], { vote: context.prevVote });
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['comment-vote', commentId], { vote: data.vote });
      setOptimisticVote(data.vote);
      if (typeof data.upvotesCount === 'number' && typeof data.downvotesCount === 'number') {
        setOptimisticScore(data.upvotesCount - data.downvotesCount);
      }
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['replies'] });
    },
  });

  const handleVote = (type: VoteType) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    voteMutation.mutate(type);
  };

  return {
    userVote: optimisticVote,
    score: optimisticScore,
    isVoting: voteMutation.isPending,
    vote: handleVote,
  };
}
