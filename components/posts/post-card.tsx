'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/services/posts';
import PostVoteButtons from '@/components/posts/post-vote-buttons';
import { MessageSquare, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    // Only navigate if click was directly on card or non-interactive child
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[data-interactive="true"]')
    ) {
      return;
    }
    router.push(`/posts/${post._id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-6 text-card-foreground shadow-xs transition-all duration-200 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div>
        {/* Cover Image (if available) */}
        {post.coverImage && (
          <div className="mb-3.5 sm:mb-4 overflow-hidden rounded-xl bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-40 sm:h-52 md:h-60 w-full object-cover transition-transform duration-300 group-hover:scale-102"
              loading="lazy"
            />
          </div>
        )}

        {/* Header / Author & Category */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight text-foreground sm:text-sm truncate">
                {post.author?.name || 'Anonymous'}
              </p>
              <p className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>

          {post.category && (
            <Link
              href={`/search?category=${encodeURIComponent(post.category)}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-muted/80 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary shrink-0"
            >
              {post.category.replaceAll('_', ' ')}
            </Link>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {post.summary}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 sm:pt-4">
        <div onClick={(e) => e.stopPropagation()}>
          <PostVoteButtons
            postId={post._id}
            score={post.score}
            upvotesCount={post.upvotesCount}
            downvotesCount={post.downvotesCount}
          />
        </div>

        <Link
          href={`/posts/${post._id}#comments`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:text-primary"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Discussion</span>
        </Link>
      </div>
    </article>
  );
}
