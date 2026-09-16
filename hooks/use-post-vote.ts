'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMyPostVote, votePost, type VoteType } from '@/services/votes';
import { useAuthStore } from '@/store/auth-store';

interface InitialCounts {
  upvotesCount: number;
  downvotesCount: number;
  score: number;
}

export function usePostVote(postId: string, initialCounts?: InitialCounts) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: myVoteData } = useQuery({
    queryKey: ['post-vote', postId],
    queryFn: () => getMyPostVote(postId),
    enabled: !!postId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => votePost(postId, type),
    onMutate: async (newVoteType) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post-vote', postId] });

      // Snapshot the previous vote
      const previousVote = queryClient.getQueryData<{ vote: VoteType | null }>([
        'post-vote',
        postId,
      ]);

      const currentVote = previousVote?.vote ?? null;
      let nextVote: VoteType | null = newVoteType;

      if (currentVote === newVoteType) {
        nextVote = null;
      }

      // Optimistically update vote state
      queryClient.setQueryData(['post-vote', postId], { vote: nextVote });

      return { previousVote };
    },
    onError: (_err, _newVoteType, context) => {
      if (context?.previousVote !== undefined) {
        queryClient.setQueryData(['post-vote', postId], context.previousVote);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['post-vote', postId], { vote: data.vote });
      // Invalidate relevant post queries to sync counters across list/detail
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
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
