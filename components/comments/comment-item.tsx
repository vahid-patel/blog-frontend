'use client';

import { useState } from 'react';
import type { Comment } from '@/services/comments';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useCommentReplies,
} from '@/hooks/use-comments';
import { useAuthStore } from '@/store/auth-store';
import CommentVoteButtons from './comment-vote-buttons';
import CommentInput from './comment-input';
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  isReply?: boolean;
  parentCommentId?: string;
  depth?: number;
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
  parentCommentId,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const currentUserId = user?.userId || (user as any)?._id || (user as any)?.id;
  const commentAuthorId = typeof comment.author === 'string' ? comment.author : comment.author?._id || (comment.author as any)?.id;
  const isOwner = Boolean(currentUserId && commentAuthorId && currentUserId === commentAuthorId);
  const isAdmin = user?.role === 'ADMIN';

  // Replies query for comments/replies
  const {
    data: repliesData,
    isLoading: isLoadingReplies,
  } = useCommentReplies(comment._id, 1, showReplies);

  const createReplyMutation = useCreateComment(postId);
  const updateCommentMutation = useUpdateComment(
    postId,
    isReply ? parentCommentId : undefined
  );
  const deleteCommentMutation = useDeleteComment(
    postId,
    isReply ? parentCommentId : undefined
  );

  const handleReplySubmit = (content: string) => {
    createReplyMutation.mutate(
      {
        content,
        parentComment: comment._id,
      },
      {
        onSuccess: () => {
          setIsReplying(false);
          setShowReplies(true);
        },
      }
    );
  };

  const handleUpdateSubmit = (content: string) => {
    updateCommentMutation.mutate(
      {
        commentId: comment._id,
        data: { content },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(comment._id);
    }
  };

  const hasReplies =
    (comment.repliesCount && comment.repliesCount > 0) ||
    (repliesData?.replies && repliesData.replies.length > 0) ||
    showReplies;

  const repliesCount = repliesData?.replies?.length ?? comment.repliesCount ?? 0;

  return (
    <div
      className={`group relative ${
        isReply
          ? depth > 2
            ? 'mt-2.5 pl-2 sm:pl-3.5 border-l-2 border-primary/30'
            : 'mt-3 pl-2.5 sm:pl-4 border-l-2 border-border/70'
          : 'py-3.5 sm:py-4 border-b border-border/40'
      }`}
    >
      {/* Author & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
            {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'A'}
          </span>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-xs font-semibold text-foreground">
              {comment.author?.name || 'Anonymous'}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
            <time
              dateTime={comment.createdAt}
              className="text-[10px] sm:text-xs text-muted-foreground"
            >
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        </div>

        {/* Edit / Delete Dropdown for owner/admin */}
        {(isOwner || isAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {isOwner && (
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                variant="destructive"
                className="cursor-pointer gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content or Edit Form */}
      <div className="mt-2 text-xs sm:text-sm text-foreground/90 pl-7 sm:pl-9.5">
        {isEditing ? (
          <div className="mt-2">
            <CommentInput
              initialValue={comment.content}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              isSubmitting={updateCommentMutation.isPending}
              autoFocus
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}

        {/* Actions bar */}
        {!isEditing && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            {/* Upvote / Downvote */}
            <CommentVoteButtons
              commentId={comment._id}
              score={comment.score}
            />

            {/* Reply toggle - available for top-level and nested replies */}
            <button
              type="button"
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>

            {/* View Replies Toggle if there are replies or user is viewing */}
            {hasReplies && (
              <button
                type="button"
                onClick={() => setShowReplies(!showReplies)}
                className="inline-flex items-center gap-1 font-medium text-primary/90 hover:text-primary transition-colors"
              >
                <CornerDownRight className="h-3.5 w-3.5" />
                <span>
                  {showReplies
                    ? 'Hide replies'
                    : repliesCount > 0
                    ? `Show ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`
                    : 'Show replies'}
                </span>
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Reply Input Box */}
        {isReplying && (
          <div className="mt-3 rounded-xl bg-muted/20 p-3">
            <CommentInput
              placeholder={`Replying to ${comment.author?.name || 'comment'}...`}
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              submitLabel="Reply"
              isSubmitting={createReplyMutation.isPending}
              autoFocus
            />
          </div>
        )}

        {/* Nested Replies List */}
        {showReplies && (
          <div className="mt-3 space-y-3">
            {isLoadingReplies ? (
              <div className="py-2 text-xs text-muted-foreground animate-pulse">
                Loading replies...
              </div>
            ) : repliesData?.replies && repliesData.replies.length > 0 ? (
              repliesData.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  isReply={true}
                  parentCommentId={comment._id}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="py-2 text-xs text-muted-foreground italic">
                No replies yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
