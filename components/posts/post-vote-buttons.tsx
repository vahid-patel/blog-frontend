'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { usePostVote } from '@/hooks/use-post-vote';
import { cn } from '@/lib/utils';

interface PostVoteButtonsProps {
  postId: string;
  score: number;
  upvotesCount: number;
  downvotesCount: number;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export default function PostVoteButtons({
  postId,
  score,
  upvotesCount,
  downvotesCount,
  layout = 'horizontal',
  className,
}: PostVoteButtonsProps) {
  const { userVote, isVoting, vote } = usePostVote(postId, {
    score,
    upvotesCount,
    downvotesCount,
  });

  const isUpvoted = userVote === 'UPVOTE';
  const isDownvoted = userVote === 'DOWNVOTE';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border bg-muted/40 p-1 text-xs font-medium backdrop-blur-sm',
        layout === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-1.5',
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
          'flex items-center justify-center rounded-full p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isUpvoted
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-emerald-600'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5 fill-current" />
      </button>

      {/* Score */}
      <span
        className={cn(
          'px-1 font-semibold tabular-nums',
          isUpvoted && 'text-emerald-600 dark:text-emerald-400',
          isDownvoted && 'text-rose-600 dark:text-rose-400',
          !isUpvoted && !isDownvoted && 'text-foreground/80'
        )}
      >
        {score}
      </span>

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
          'flex items-center justify-center rounded-full p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isDownvoted
            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-rose-600'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5 fill-current" />
      </button>
    </div>
  );
}
