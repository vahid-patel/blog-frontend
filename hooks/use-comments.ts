'use client';

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
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useCommentVote(commentId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: myVoteData } = useQuery({
    queryKey: ['comment-vote', commentId],
    queryFn: () => getMyCommentVote(commentId),
    enabled: !!commentId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => voteComment(commentId, type),
    onMutate: async (newVoteType) => {
      await queryClient.cancelQueries({ queryKey: ['comment-vote', commentId] });

      const previousVote = queryClient.getQueryData<{ vote: VoteType | null }>([
        'comment-vote',
        commentId,
      ]);

      const currentVote = previousVote?.vote ?? null;
      let nextVote: VoteType | null = newVoteType;

      if (currentVote === newVoteType) {
        nextVote = null;
      }

      queryClient.setQueryData(['comment-vote', commentId], { vote: nextVote });

      return { previousVote };
    },
    onError: (_err, _newVoteType, context) => {
      if (context?.previousVote !== undefined) {
        queryClient.setQueryData(['comment-vote', commentId], context.previousVote);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['comment-vote', commentId], { vote: data.vote });
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
    userVote: myVoteData?.vote ?? null,
    isVoting: voteMutation.isPending,
    vote: handleVote,
  };
}
