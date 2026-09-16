import Link from 'next/link';
import { Post } from '@/services/posts';
import PostVoteButtons from '@/components/posts/post-vote-buttons';
import { MessageSquare, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Cover Image (if available) */}
        {post.coverImage && (
          <Link href={`/posts/${post._id}`} className="mb-4 block overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-102"
              loading="lazy"
            />
          </Link>
        )}

        {/* Header / Author */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <div>
              <p className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
                {post.author?.name || 'Anonymous'}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {post.category && (
            <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {post.category.replaceAll('_', ' ')}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post._id}`} className="block">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        {post.summary && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {post.summary}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <PostVoteButtons
          postId={post._id}
          score={post.score}
          upvotesCount={post.upvotesCount}
          downvotesCount={post.downvotesCount}
        />

        <Link
          href={`/posts/${post._id}#comments`}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Discussion</span>
        </Link>
      </div>
    </article>
  );
}
