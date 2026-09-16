"use client";

import Link from "next/link";
import { use } from "react";

import PostContent from "@/components/posts/post-content";
import { usePost } from "@/hooks/use-posts";

interface PostDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PostDetailsPage({
  params,
}: PostDetailsPageProps) {
  const { id } = use(params);

  const {
    data: post,
    isLoading,
    isError,
  } = usePost(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
          <div className="h-40 rounded bg-muted" />
        </div>
      </main>
    );
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border p-8 text-center">
          <h1 className="text-xl font-semibold">
            Post not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This post may have been deleted or is no longer
            published.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium underline"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article>
        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <header>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{post.author.name}</span>

            <span>•</span>

            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {post.title}
          </h1>

          {post.category && (
            <span className="mt-4 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {post.category.replaceAll("_", " ")}
            </span>
          )}

          {post.summary && (
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {post.summary}
            </p>
          )}
        </header>

        {/* Content */}
        <div className="mt-8">
          <PostContent content={post.content} />
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 flex gap-5 border-t pt-5 text-sm text-muted-foreground">
          <span>▲ {post.upvotesCount}</span>
          <span>▼ {post.downvotesCount}</span>
          <span>Score: {post.score}</span>
        </div>
      </article>
    </main>
  );
}