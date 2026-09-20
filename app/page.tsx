'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInfinitePosts } from '@/hooks/use-posts';
import PostCard from '@/components/posts/post-card';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';
import type { SortByOption } from '@/services/posts';
import {
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  PenSquare,
  RefreshCw,
  Zap,
  ServerCrash,
  Flame,
  Clock,
  Heart,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SORT_OPTIONS: { label: string; value: SortByOption; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Newest', value: 'newest', icon: Sparkles },
  { label: 'Trending', value: 'trending', icon: Flame },
  { label: 'Most Liked', value: 'most_liked', icon: Heart },
  { label: 'Oldest', value: 'oldest', icon: Clock },
];

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [sortBy, setSortBy] = useState<SortByOption>('newest');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(6, sortBy);

  // Sentinel ref for infinite scroll / doomscrolling
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver for continuous infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '400px', // Fetch early before reaching absolute bottom for seamless doomscrolling
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading || isRefetching) {
      interval = setInterval(() => {
        setLoadSeconds((s) => s + 1);
      }, 1000);
    } else {
      setLoadSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, isRefetching]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalPosts = data?.pages[0]?.totalPosts ?? 0;

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
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
            <Button type="submit" size="default" className="rounded-xl font-semibold">
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
      <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        {/* Header with Title & Write Post */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>Community Feed</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalPosts > 0
                ? `${totalPosts} community article${totalPosts === 1 ? '' : 's'} available`
                : 'Explore articles from writers around the globe'}
            </p>
          </div>

          <Link href="/create-post">
            <Button size="sm" className="gap-1.5 text-xs font-semibold rounded-xl">
              <PenSquare className="h-3.5 w-3.5" />
              <span>Write Post</span>
            </Button>
          </Link>
        </div>

        {/* Sort / Filter Tabs */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border bg-card/70 p-1.5 shadow-xs backdrop-blur-sm">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State with Server Wake-up Notice */}
        {isLoading ? (
          <div className="space-y-4">
            {loadSeconds >= 3 && (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground shadow-xs animate-in fade-in duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Zap className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-xs text-foreground flex items-center gap-2">
                    <span>Waking up server container...</span>
                    <span className="text-[11px] font-normal text-muted-foreground">({loadSeconds}s)</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Free-tier server is spinning up from idle mode. Your feed will display automatically.
                  </p>
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border bg-card p-6"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
              <ServerCrash className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Server took longer than expected to wake up
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground">
              Because the backend is hosted on a free-tier sleeping container, it might need another moment to finish booting.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => refetch()}
                className="gap-2 rounded-xl font-semibold"
                size="sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Loading Feed</span>
              </Button>
            </div>
          </div>
        ) : allPosts.length > 0 ? (
          <div className="space-y-5">
            {allPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Infinite Scroll / Doomscroll Sentinel & Loading Indicator */}
            <div ref={sentinelRef} className="py-6 text-center">
              {isFetchingNextPage ? (
                <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-xs font-semibold text-primary shadow-xs">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more stories...</span>
                </div>
              ) : hasNextPage ? (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Scroll down for more articles
                </p>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-6">
                  <div className="h-1 w-12 rounded-full bg-border mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">
                    ✨ You&apos;ve reached the end of the feed.
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Why not write your own article to keep the conversation going?
                  </p>
                </div>
              )}
            </div>
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
              <Button className="font-semibold">Create a Post</Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}