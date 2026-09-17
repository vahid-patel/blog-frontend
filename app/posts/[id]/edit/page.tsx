'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/core';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';
import { usePost, useUpdatePost } from '@/hooks/use-posts';
import { useAuthStore } from '@/store/auth-store';
import PostEditor from '@/components/posts/post-editor';
import PostContent from '@/components/posts/post-content';
import { uploadImage } from '@/services/upload';
import {
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Edit3,
  X,
  Plus,
  Save,
  Loader2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type PostStatus = 'DRAFT' | 'PUBLISHED';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: post, isLoading, isError } = usePost(id);
  const updatePostMutation = useUpdatePost(id);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');
  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<PostStatus>('PUBLISHED');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (post && !isInitialized) {
      setTitle(post.title || '');
      setSummary(post.summary || '');
      setCoverImage(post.coverImage || '');
      setCategory(post.category || '');
      setTags(post.tags || []);
      setStatus((post.status as PostStatus) || 'PUBLISHED');
      setContent(post.content);
      setIsInitialized(true);
    }
  }, [post, isInitialized]);

  const handleCoverFileUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      setCoverUploadError('Only JPG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCoverUploadError('Cover image exceeds 10MB limit.');
      return;
    }

    try {
      setIsUploadingCover(true);
      setCoverUploadError('');
      const result = await uploadImage(file);
      if (result?.url) {
        setCoverImage(result.url);
      }
    } catch (err: any) {
      setCoverUploadError(
        err?.response?.data?.message || 'Failed to upload cover image. Please try again.'
      );
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverFileUpload(file);
    }
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <h1 className="text-xl font-bold">Post not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The post you are trying to edit does not exist.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = user?.userId === post.author?._id;
  const isAdmin = user?.role === 'ADMIN';

  if (!isAuthenticated || (!isOwner && !isAdmin)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <h1 className="text-xl font-bold text-destructive">Unauthorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to edit this post.
          </p>
          <Link href={`/posts/${id}`} className="mt-6 inline-block">
            <Button variant="outline">Back to Post</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content || updatePostMutation.isPending) return;

    updatePostMutation.mutate(
      {
        title: title.trim(),
        summary: summary.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        category: category || undefined,
        tags,
        content,
        status,
      },
      {
        onSuccess: () => {
          router.push(`/posts/${id}`);
        },
      }
    );
  };

  return (
    <main className="min-h-screen bg-muted/20 pb-20 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top Bar Navigation & Mode Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <Link
            href={`/posts/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Link>

          {/* Edit / Preview Tabs */}
          <div className="flex items-center rounded-xl bg-card border p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'edit'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Save Actions */}
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="PUBLISHED">Public</option>
              <option value="DRAFT">Draft</option>
            </select>

            <Button
              onClick={() => handleSubmit()}
              disabled={!title.trim() || updatePostMutation.isPending || isUploadingCover}
              size="sm"
              className="gap-1.5 font-semibold"
            >
              <Save className="h-3.5 w-3.5" />
              <span>
                {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
              </span>
            </Button>
          </div>
        </div>

        {/* Tab 1: EDIT MODE */}
        {activeTab === 'edit' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your story..."
                maxLength={300}
                className="w-full bg-transparent text-3xl font-extrabold tracking-tight placeholder:text-muted-foreground/50 focus:outline-none sm:text-4xl"
                required
              />
              <div className="text-right text-[11px] text-muted-foreground">
                {title.length}/300
              </div>
            </div>

            {/* Cover Image & Category Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-xs">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Topic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category (optional)</option>
                  {POST_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Image Uploader */}
              <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Cover Image</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCoverInputMode('upload')}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        coverInputMode === 'upload'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Upload
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setCoverInputMode('url')}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        coverInputMode === 'url'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                {coverInputMode === 'upload' ? (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/50 p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition"
                  >
                    {isUploadingCover ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Optimizing & Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Upload className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium text-foreground">
                          Click to upload new cover photo
                        </span>
                        <span className="text-[11px]">Auto-compressed & resized</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}

                {coverUploadError && (
                  <p className="text-xs text-destructive">{coverUploadError}</p>
                )}
              </div>
            </div>

            {/* Cover Image Preview */}
            {coverImage && (
              <div className="relative overflow-hidden rounded-2xl border bg-card max-h-72 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-72 object-cover"
                  onError={() => {}}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm hover:bg-background shadow-xs transition"
                  title="Remove cover image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Summary Lead */}
            <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Article Summary / Hook</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {summary.length}/500
                </span>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Give readers a compelling preview..."
                rows={2}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Tiptap Rich-Text Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Story Content
              </label>
              {content && (
                <PostEditor
                  initialContent={content}
                  onChange={setContent}
                  placeholder="Revise your story..."
                />
              )}
            </div>

            {/* Interactive Tags */}
            <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tags (Press Enter or comma to add)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary/70 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "e.g. nextjs, ai" : "Add tag..."}
                    className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  {tagInput.trim() && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleAddTag}
                      className="h-7 w-7"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {updatePostMutation.isError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                Failed to update post. Please try again.
              </div>
            )}
          </form>
        ) : (
          /* Tab 2: LIVE PREVIEW MODE */
          <article className="rounded-2xl border bg-card p-6 sm:p-10 shadow-xs">
            {coverImage && (
              <div className="mb-8 overflow-hidden rounded-2xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={title || 'Cover'}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            {category && (
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {category.replaceAll('_', ' ')}
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {title || 'Untitled Post'}
            </h1>

            {summary && (
              <div className="mt-6 rounded-xl border-l-4 border-primary bg-muted/30 p-4 text-base italic text-muted-foreground leading-relaxed">
                {summary}
              </div>
            )}

            <div className="mt-8 border-t pt-8">
              {content && <PostContent content={content} />}
            </div>

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
