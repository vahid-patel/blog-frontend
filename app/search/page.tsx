'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchPosts, usePosts } from '@/hooks/use-posts';
import PostCard from '@/components/posts/post-card';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';
import { Search, X, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // If keyword is provided, use search query; otherwise fallback to general posts
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
  } = useSearchPosts(initialKeyword, 1, 20);

  const {
    data: fallbackData,
    isLoading: isFallbackLoading,
  } = usePosts(1, 20);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  const handleCategorySelect = (categoryValue: string) => {
    const nextCategory = selectedCategory === categoryValue ? '' : categoryValue;
    setSelectedCategory(nextCategory);
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (nextCategory) params.set('category', nextCategory);
    router.push(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setKeyword('');
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  // Determine active posts to show
  const isQuerying = Boolean(initialKeyword.trim());
  const rawPosts = isQuerying
    ? searchData?.posts || []
    : fallbackData?.posts || [];

  // Filter by category in frontend if category is selected
  const filteredPosts = selectedCategory
    ? rawPosts.filter((post) => post.category === selectedCategory)
    : rawPosts;

  const isLoading = isQuerying ? isSearchLoading : isFallbackLoading;

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Explore & Search
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find articles by title, keywords, tags, or topics.
          </p>
        </header>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search posts by keywords, topic, or tags..."
              className="w-full rounded-2xl border border-border/80 bg-card py-3.5 pl-12 pr-28 text-base shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {keyword && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 p-1 text-muted-foreground hover:text-foreground"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-2.5 rounded-xl px-4"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Category Pills Filter */}
        <div className="mb-8">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              All Topics
            </button>
            {POST_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="text-sm text-muted-foreground">
            {isQuerying ? (
              <span>
                Search results for{' '}
                <strong className="text-foreground">"{initialKeyword}"</strong>
              </span>
            ) : selectedCategory ? (
              <span>
                Showing posts in{' '}
                <strong className="text-foreground">
                  {selectedCategory.replaceAll('_', ' ')}
                </strong>
              </span>
            ) : (
              <span>Discover latest articles</span>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'} found
          </span>
        </div>

        {/* Posts Feed */}
        {isLoading || isSearchFetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border bg-card/60 p-6"
              />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-5">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <h3 className="mt-3 text-lg font-semibold text-foreground">
              No matching articles
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isQuerying
                ? `We couldn't find any posts matching "${initialKeyword}". Try different keywords or browse all categories.`
                : 'No articles published in this category yet.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setKeyword('');
                setSelectedCategory('');
                router.push('/search');
              }}
              className="mt-5"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
