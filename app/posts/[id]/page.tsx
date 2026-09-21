'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import PostContent from '@/components/posts/post-content';
import PostVoteButtons from '@/components/posts/post-vote-buttons';
import CommentsSection from '@/components/comments/comments-section';
import { usePost, useDeletePost } from '@/hooks/use-posts';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, Calendar, Tag, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostDetailsPage({ params }: PostDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: post, isLoading, isError } = usePost(id);
  const deletePostMutation = useDeletePost();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-10 w-4/5 rounded bg-muted" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="h-32 rounded-lg bg-muted" />
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Post not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This post may have been removed or is no longer published.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const isAuthor = user?.userId === post.author?._id;
  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this post?')) {
      deletePostMutation.mutate(post._id, {
        onSuccess: () => {
          router.push('/');
        },
      });
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
      <article>
        {/* Navigation / Back link & Author Actions */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            {post.category && (
              <span className="rounded-full bg-primary/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-primary">
                {post.category.replaceAll('_', ' ')}
              </span>
            )}

            {(isAuthor || isAdmin) && (
              <div className="flex items-center gap-1 ml-1 sm:ml-2 border-l pl-1.5 sm:pl-2">
                <Link href={`/posts/${post._id}/edit`}>
                  <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-lg">
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                  className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{deletePostMutation.isPending ? 'Deleting...' : 'Delete'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight sm:leading-tight break-words">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mt-4 sm:mt-6 overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-48 sm:h-80 md:h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Author Header & Date & Read Time */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-y border-border/60 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs sm:text-sm font-bold text-primary">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {post.author?.name || 'Anonymous'}
              </p>
              <p className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>
                  {post.content ? `${Math.max(1, Math.ceil(JSON.stringify(post.content).length / 1000))} min read` : '1 min read'}
                </span>
              </p>
            </div>
          </div>

          {/* Voting Action Header */}
          <PostVoteButtons
            postId={post._id}
            score={post.score}
            upvotesCount={post.upvotesCount}
            downvotesCount={post.downvotesCount}
          />
        </div>

        {/* Summary Lead */}
        {post.summary && (
          <div className="mt-5 sm:mt-6 rounded-xl border-l-4 border-primary bg-muted/30 p-3.5 sm:p-4 text-xs sm:text-sm md:text-base italic leading-relaxed text-muted-foreground">
            {post.summary}
          </div>
        )}

        {/* Full Rich-Text Content */}
        <div className="mt-6 sm:mt-8">
          <PostContent content={post.content} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-border/60 pt-5 sm:pt-6">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Bottom Bar */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Enjoyed this article?
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground">
              Vote to support the creator
            </span>
          </div>

          <PostVoteButtons
            postId={post._id}
            score={post.score}
            upvotesCount={post.upvotesCount}
            downvotesCount={post.downvotesCount}
          />
        </div>
      </article>

      {/* Discussion & Comments Section */}
      <CommentsSection postId={post._id} />
    </main>
  );
}
