'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMyPostVote, votePost, type VoteType } from '@/services/votes';
import { useAuthStore } from '@/store/auth-store';

export function usePostVote(postId: string, initialScore: number = 0) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: myVoteData } = useQuery({
    queryKey: ['post-vote', postId],
    queryFn: () => getMyPostVote(postId),
    enabled: !!postId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const serverVote = myVoteData?.vote ?? null;

  // Local optimistic state for instant UI response (< 1ms)
  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(serverVote);
  const [optimisticScore, setOptimisticScore] = useState<number>(initialScore);

  // Sync with server vote when query data loads/changes
  useEffect(() => {
    setOptimisticVote(serverVote);
  }, [serverVote]);

  // Sync with initialScore when prop updates
  useEffect(() => {
    setOptimisticScore(initialScore);
  }, [initialScore]);

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => votePost(postId, type),
    onMutate: async (newVoteType) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post-vote', postId] });

      const prevVote = optimisticVote;
      const prevScore = optimisticScore;

      // Calculate instant next vote and score
      let nextVote: VoteType | null = newVoteType;
      let scoreDelta = 0;

      if (prevVote === newVoteType) {
        // Toggle off
        nextVote = null;
        scoreDelta = newVoteType === 'UPVOTE' ? -1 : 1;
      } else if (prevVote === 'UPVOTE' && newVoteType === 'DOWNVOTE') {
        scoreDelta = -2;
      } else if (prevVote === 'DOWNVOTE' && newVoteType === 'UPVOTE') {
        scoreDelta = 2;
      } else {
        // From null to UPVOTE or DOWNVOTE
        scoreDelta = newVoteType === 'UPVOTE' ? 1 : -1;
      }

      const nextScore = prevScore + scoreDelta;

      // Apply optimistic update immediately
      setOptimisticVote(nextVote);
      setOptimisticScore(nextScore);

      queryClient.setQueryData(['post-vote', postId], { vote: nextVote });

      return { prevVote, prevScore };
    },
    onError: (_err, _newVoteType, context) => {
      // Rollback on network failure
      if (context) {
        setOptimisticVote(context.prevVote);
        setOptimisticScore(context.prevScore);
        queryClient.setQueryData(['post-vote', postId], { vote: context.prevVote });
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['post-vote', postId], { vote: data.vote });
      setOptimisticVote(data.vote);
      if (typeof data.upvotesCount === 'number' && typeof data.downvotesCount === 'number') {
        setOptimisticScore(data.upvotesCount - data.downvotesCount);
      }
      // Silently sync post cache
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
    userVote: optimisticVote,
    score: optimisticScore,
    isVoting: voteMutation.isPending,
    vote: handleVote,
  };
}
