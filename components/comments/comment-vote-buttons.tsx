'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCommentVote } from '@/hooks/use-comments';
import { cn } from '@/lib/utils';

interface CommentVoteButtonsProps {
  commentId: string;
  score: number;
  className?: string;
}

export default function CommentVoteButtons({
  commentId,
  score: initialScore = 0,
  className,
}: CommentVoteButtonsProps) {
  const { userVote, score, isVoting, vote } = useCommentVote(commentId, initialScore);

  const isUpvoted = userVote === 'UPVOTE';
  const isDownvoted = userVote === 'DOWNVOTE';

  // Rule: Do not show 0 likes; only show when greater than 0 or smaller than 0
  const hasNonZeroScore = score !== 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground transition-all',
        className
      )}
    >
      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote('UPVOTE')}
        title="Upvote comment"
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-all active:scale-90 hover:bg-muted',
          isUpvoted
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
            : 'hover:text-emerald-600'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5 fill-current" />
      </button>

      {/* Score: only shown when score > 0 or score < 0 (hidden when 0) */}
      {hasNonZeroScore && (
        <span
          className={cn(
            'min-w-[1rem] text-center font-semibold tabular-nums transition-colors',
            isUpvoted && 'text-emerald-600 dark:text-emerald-400',
            isDownvoted && 'text-rose-600 dark:text-rose-400',
            !isUpvoted && !isDownvoted && 'text-foreground/80'
          )}
        >
          {score}
        </span>
      )}

      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote('DOWNVOTE')}
        title="Downvote comment"
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-all active:scale-90 hover:bg-muted',
          isDownvoted
            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-semibold'
            : 'hover:text-rose-600'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5 fill-current" />
      </button>
    </div>
  );
}
