'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInfinitePosts } from '@/hooks/use-posts';
import PostCard from '@/components/posts/post-card';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';
import { Search, Loader2, Sparkles, ArrowRight, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalPosts = data?.pages[0]?.totalPosts ?? 0;

  return (
    <main className="min-h-screen bg-muted/20 pb-16">
      {/* Hero Header Section */}
      <section className="border-b bg-card/60 backdrop-blur-sm py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to BlogSocial</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Where ideas connect and grow.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover deep-dives, industry stories, and community discussions from creators around the world.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-8 max-w-lg flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search topics, articles, authors..."
                className="w-full rounded-xl border border-border/80 bg-background py-2.5 pl-10 pr-4 text-sm shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" size="default" className="rounded-xl">
              Search
            </Button>
          </form>

          {/* Popular Categories Shortcut */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Popular:
            </span>
            {POST_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.value}
                href={`/search?category=${cat.value}`}
                className="rounded-full bg-background border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline ml-1"
            >
              <span>All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feed Content */}
      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Latest Articles
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalPosts > 0
                ? `${totalPosts} community article${totalPosts === 1 ? '' : 's'} available`
                : 'Fresh content from community writers'}
            </p>
          </div>

          <Link href="/create-post">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <PenSquare className="h-3.5 w-3.5" />
              <span>Write Post</span>
            </Button>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border bg-card p-6"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center text-sm text-destructive">
            Failed to load feed. Please check your backend connection.
          </div>
        ) : allPosts.length > 0 ? (
          <div className="space-y-5">
            {allPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Pagination / Load More Button */}
            {hasNextPage && (
              <div className="pt-6 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-xl px-8 font-semibold shadow-xs"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <span>Load More Posts</span>
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && allPosts.length > 0 && (
              <p className="pt-8 text-center text-xs text-muted-foreground">
                You&apos;ve reached the end of the feed.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No posts found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share an article with the community!
            </p>
            <Link href="/create-post" className="mt-5 inline-block">
              <Button>Create a Post</Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}