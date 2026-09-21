'use client';

import { useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/core';
import { POST_CATEGORIES } from '@/lib/constants/post-categories';
import { usePost, useUpdatePost } from '@/hooks/use-posts';
import type { Post } from '@/services/posts';
import { useAuthStore } from '@/store/auth-store';
import { useMounted } from '@/hooks/use-mounted';
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

interface EditPostFormProps {
  post: Post;
  id: string;
}

function EditPostForm({ post, id }: EditPostFormProps) {
  const router = useRouter();
  const updatePostMutation = useUpdatePost(id);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState(post.title || '');
  const [summary, setSummary] = useState(post.summary || '');
  const [coverImage, setCoverImage] = useState(post.coverImage || '');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');
  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState(post.category || '');
  const [validationError, setValidationError] = useState('');
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<PostStatus>((post.status as PostStatus) || 'PUBLISHED');
  const [content, setContent] = useState<JSONContent | null>(post.content || null);

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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to upload cover image. Please try again.';
      setCoverUploadError(msg);
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
    if (updatePostMutation.isPending) return;

    if (!title.trim()) {
      setValidationError('Please enter a post title.');
      return;
    }
    if (!category) {
      setValidationError('Please select a topic category.');
      return;
    }
    setValidationError('');

    updatePostMutation.mutate(
      {
        title: title.trim(),
        summary: summary.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        category: category,
        tags,
        content: content || undefined,
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
              disabled={!title.trim() || !category || updatePostMutation.isPending || isUploadingCover}
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError('');
                }}
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Topic Category <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-primary">Compulsory</span>
                </div>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category (compulsory)...</option>
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
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        coverInputMode === 'upload'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverInputMode('url')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        coverInputMode === 'url'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {coverInputMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverFileChange}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="w-full justify-center gap-2 border-dashed py-5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Choose image file from computer</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}

                {coverUploadError && (
                  <p className="text-xs font-medium text-destructive">
                    {coverUploadError}
                  </p>
                )}

                {coverImage && (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-border/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground shadow-xs backdrop-blur-xs hover:bg-background"
                      title="Remove cover"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Summary / Hook */}
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
                placeholder="Give readers a compelling 2-sentence preview of what they will discover..."
                rows={2}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Tiptap Rich-Text Editor with direct image uploads */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Story Content
              </label>
              {content && (
                <PostEditor
                  initialContent={content}
                  onChange={setContent}
                  placeholder="Tell your story... You can add headings, code blocks, lists, quotes, and drop images anywhere."
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
                    placeholder={tags.length === 0 ? "e.g. nextjs, ai, design" : "Add tag..."}
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

            {/* Validation Error Banner */}
            {validationError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {validationError}
              </div>
            )}

            {/* Error Banner */}
            {updatePostMutation.isError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                Failed to update post. Please try again.
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Post Visibility:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}
                  className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="PUBLISHED">Public (Publish to feed)</option>
                  <option value="DRAFT">Draft (Save privately)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={!title.trim() || !category || updatePostMutation.isPending || isUploadingCover}
                size="default"
                className="gap-2 font-semibold px-6 shadow-sm"
              >
                <Save className="h-4 w-4" />
                <span>
                  {updatePostMutation.isPending ? 'Saving changes...' : 'Save Changes'}
                </span>
              </Button>
            </div>
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

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const mounted = useMounted();
  const { user, isAuthenticated } = useAuthStore();
  const { data: post, isLoading, isError } = usePost(id);

  if (!mounted || isLoading) {
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

  const currentUserId = user?.userId || (user as any)?._id || (user as any)?.id;
  const postAuthorId = typeof post.author === 'string' ? post.author : post.author?._id || (post.author as any)?.id;
  const isOwner = Boolean(currentUserId && postAuthorId && currentUserId === postAuthorId);
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

  return <EditPostForm post={post} id={id} />;
}
