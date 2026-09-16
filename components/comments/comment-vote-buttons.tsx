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
  score,
  className,
}: CommentVoteButtonsProps) {
  const { userVote, isVoting, vote } = useCommentVote(commentId);

  const isUpvoted = userVote === 'UPVOTE';
  const isDownvoted = userVote === 'DOWNVOTE';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground',
        className
      )}
    >
      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote('UPVOTE')}
        title="Upvote comment"
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-colors hover:bg-muted',
          isUpvoted
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
            : 'hover:text-emerald-600'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5 fill-current" />
      </button>

      <span
        className={cn(
          'min-w-[1.25rem] text-center font-semibold tabular-nums',
          isUpvoted && 'text-emerald-600 dark:text-emerald-400',
          isDownvoted && 'text-rose-600 dark:text-rose-400'
        )}
      >
        {score}
      </span>

      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote('DOWNVOTE')}
        title="Downvote comment"
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-colors hover:bg-muted',
          isDownvoted
            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
            : 'hover:text-rose-600'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5 fill-current" />
      </button>
    </div>
  );
}
