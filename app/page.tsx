"use client";

import { usePosts } from "@/hooks/use-posts";
import PostCard from "@/components/posts/post-card";

export default function Home() {
  const { data, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading posts...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Failed to load posts.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Latest Posts
          </h1>

          <p className="mt-2 text-gray-500">
            Discover interesting articles from our community.
          </p>
        </header>

        <div className="space-y-5">
          {data?.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}