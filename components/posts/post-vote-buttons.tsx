'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { usePostVote } from '@/hooks/use-post-vote';
import { cn } from '@/lib/utils';

interface PostVoteButtonsProps {
  postId: string;
  score: number;
  upvotesCount?: number;
  downvotesCount?: number;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export default function PostVoteButtons({
  postId,
  score: initialScore = 0,
  layout = 'horizontal',
  className,
}: PostVoteButtonsProps) {
  const { userVote, score, isVoting, vote } = usePostVote(postId, initialScore);

  const isUpvoted = userVote === 'UPVOTE';
  const isDownvoted = userVote === 'DOWNVOTE';

  // Rule: Do not show 0 likes; only show when greater than 0 or smaller than 0
  const hasNonZeroScore = score !== 0;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border bg-muted/40 p-1 text-xs font-medium backdrop-blur-sm transition-all',
        layout === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-1',
        className
      )}
    >
      {/* Upvote Button */}
      <button
        type="button"
        disabled={isVoting}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('UPVOTE');
        }}
        title="Upvote"
        className={cn(
          'flex items-center justify-center rounded-full p-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90',
          isUpvoted
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs scale-105'
            : 'text-muted-foreground hover:bg-muted hover:text-emerald-600'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5 fill-current" />
      </button>

      {/* Score: only shown when score > 0 or score < 0 (hidden when 0) */}
      {hasNonZeroScore && (
        <span
          className={cn(
            'px-1.5 font-semibold tabular-nums text-xs transition-colors',
            isUpvoted && 'text-emerald-600 dark:text-emerald-400',
            isDownvoted && 'text-rose-600 dark:text-rose-400',
            !isUpvoted && !isDownvoted && 'text-foreground/80'
          )}
        >
          {score}
        </span>
      )}

      {/* Downvote Button */}
      <button
        type="button"
        disabled={isVoting}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote('DOWNVOTE');
        }}
        title="Downvote"
        className={cn(
          'flex items-center justify-center rounded-full p-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90',
          isDownvoted
            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-xs scale-105'
            : 'text-muted-foreground hover:bg-muted hover:text-rose-600'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5 fill-current" />
      </button>
    </div>
  );
}
