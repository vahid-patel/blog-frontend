'use client';

import { usePostComments, useCreateComment } from '@/hooks/use-comments';
import CommentInput from './comment-input';
import CommentItem from './comment-item';
import { MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { data, isLoading, isError } = usePostComments(postId);
  const createCommentMutation = useCreateComment(postId);

  const handleCreateTopLevelComment = (content: string) => {
    createCommentMutation.mutate({ content });
  };

  const totalComments = data?.totalComments ?? 0;

  return (
    <section id="comments" className="mt-12 border-t border-border pt-10">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Discussion
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {totalComments}
          </span>
        </div>
      </div>

      {/* Main Comment Input Box */}
      <div className="mb-8 rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
        <CommentInput
          onSubmit={handleCreateTopLevelComment}
          isSubmitting={createCommentMutation.isPending}
          submitLabel="Post Comment"
          placeholder="What are your thoughts on this article?"
        />
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
          Failed to load comments. Please refresh the page.
        </div>
      ) : data?.comments && data.comments.length > 0 ? (
        <div className="divide-y divide-border/40">
          {data.comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to start the conversation!
          </p>
        </div>
      )}
    </section>
  );
}
