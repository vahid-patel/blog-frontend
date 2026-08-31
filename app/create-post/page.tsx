'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';

import { useCreatePost } from '@/hooks/use-create-post';
import PostEditor from '@/components/posts/post-editor';

type PostStatus = 'DRAFT' | 'PUBLISHED';

const emptyContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

export default function CreatePostPage() {
  const router = useRouter();
  const createPostMutation = useCreatePost();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<PostStatus>('PUBLISHED');

  const [content, setContent] = useState<JSONContent>(emptyContent);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    createPostMutation.mutate(
      {
        title: title.trim(),
        summary: summary.trim() || undefined,
        category: category || undefined,
        tags: parsedTags,
        content,
        status,
      },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Post</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Share your thoughts with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your post title"
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label htmlFor="summary" className="text-sm font-medium">
            Summary
          </label>

          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a short summary of your post..."
            rows={3}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>

          <PostEditor onChange={setContent} />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a category</option>

            {POST_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label htmlFor="tags" className="text-sm font-medium">
            Tags
          </label>

          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="nextjs, react, typescript"
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />

          <p className="text-xs text-muted-foreground">
            Separate multiple tags with commas.
          </p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="PUBLISHED">Publish</option>

            <option value="DRAFT">Save as Draft</option>
          </select>
        </div>

        {/* Error */}
        {createPostMutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Failed to create post. Please try again.
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createPostMutation.isPending}
            className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createPostMutation.isPending
              ? status === 'DRAFT'
                ? 'Saving...'
                : 'Publishing...'
              : status === 'DRAFT'
                ? 'Save Draft'
                : 'Publish Post'}
          </button>
        </div>
      </form>
    </main>
  );
}
