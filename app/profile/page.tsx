'use client';

import { useProfile, useDeleteMyAccount } from '@/hooks/use-profile';
import type { UserProfile } from '@/services/users';
import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useAuthStore } from '@/store/auth-store';
import { useMounted } from '@/hooks/use-mounted';
import { useUserPosts, useDeletePost } from '@/hooks/use-posts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  passwordChangeSchema,
  PasswordChangeFormData,
} from '@/lib/validations/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import PasswordRequirements from '@/components/auth/password-requirements';
import { Label } from '@/components/ui/label';
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  BadgeCheck,
  LogIn,
  BookOpen,
  PenSquare,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Heart,
  MessageSquare,
  Sparkles,
  ExternalLink,
  LogOut,
  Search,
} from 'lucide-react';

function MyPostsSection({ userId }: { userId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const { data: postsData, isLoading, isError, refetch } = useUserPosts(userId, page, 10, 'newest');
  const deletePostMutation = useDeletePost();

  const posts = postsData?.posts || [];
  const totalPosts = postsData?.totalPosts || 0;
  const totalPages = postsData?.totalPages || 1;

  // Filter posts locally if user searches within their posts
  const filteredPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const handleDeletePost = (postId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      setDeletingPostId(postId);
      deletePostMutation.mutate(postId, {
        onSuccess: () => {
          setDeletingPostId(null);
          refetch();
        },
        onError: () => {
          setDeletingPostId(null);
          alert('Failed to delete post. Please try again.');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>My Stories & Articles</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {totalPosts}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, edit, or remove your published articles and contributions.
          </p>
        </div>

        <Link href="/create-post">
          <Button size="sm" className="gap-1.5 font-semibold rounded-xl w-full sm:w-auto">
            <PenSquare className="h-4 w-4" />
            <span>Write New Story</span>
          </Button>
        </Link>
      </div>

      {/* Filter / Search within My Posts if user has posts */}
      {totalPosts > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter my stories by title, category, or tag..."
            className="w-full rounded-xl border border-border/80 bg-background py-2 pl-10 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Posts Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border bg-card p-5" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-semibold text-destructive">
            Failed to load your stories.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 rounded-xl"
          >
            Retry
          </Button>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isDeleting = deletingPostId === post._id;
            return (
              <div
                key={post._id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
              >
                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {post.category && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        {post.category.replaceAll('_', ' ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/posts/${post._id}`}
                    className="block group-hover:text-primary transition-colors"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                      {post.title}
                    </h3>
                  </Link>

                  {post.summary && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  )}

                  {/* Post Stats */}
                  <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>{post.score} points</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span>Comments</span>
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[11px] text-muted-foreground/80">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Button Group */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <Link href={`/posts/${post._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      title="View Article"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>View</span>
                    </Button>
                  </Link>

                  <Link href={`/posts/${post._id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs rounded-lg"
                      title="Edit Story"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => handleDeletePost(post._id, post.title)}
                    className="h-8 px-2.5 text-xs rounded-lg"
                    title="Delete Story"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span>Delete</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls if more than 1 page */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs rounded-lg"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-3 text-xs rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed bg-card/60 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {searchQuery ? 'No matching stories found' : 'You haven’t published any stories yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? 'Try changing your search keywords to locate your article.'
              : 'Share your ideas, tutorials, or experiences with readers on BlogSocial.'}
          </p>
          {!searchQuery && (
            <Link href="/create-post" className="mt-5 inline-block">
              <Button size="sm" className="gap-2 font-semibold rounded-xl">
                <PenSquare className="h-4 w-4" />
                <span>Write Your First Story</span>
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileContent({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name || '');
  const [activeTab, setActiveTab] = useState<'posts' | 'details' | 'security'>('posts');
  const { logout } = useAuthStore();

  const updateProfileMutation = useUpdateProfile();
  const passwordMutation = useUpdateProfile();

  const userId = user._id || user.userId;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange',
  });

  const currentNewPassword = watch('newPassword') || '';

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handleChangePassword = (data: PasswordChangeFormData) => {
    passwordMutation.mutate(
      {
        prevPassword: data.prevPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const deleteAccountMutation = useDeleteMyAccount();

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you absolutely sure you want to delete your account? All your posts, comments, and profile data will be permanently deleted. This action cannot be undone.'
      )
    ) {
      deleteAccountMutation.mutate();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const updateProfileErrorMsg =
    (updateProfileMutation.error as unknown as { response?: { data?: { message?: string } } })
      ?.response?.data?.message || 'Failed to update profile. Please try again.';

  const passwordErrorMsg =
    (passwordMutation.error as unknown as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ||
    'Failed to change password. Please verify your current password.';

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Member';

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header / User Profile Hero Card */}
        <div className="overflow-hidden rounded-2xl border bg-card p-5 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl truncate">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <BadgeCheck className="h-3 w-3" />
                    <span>{user.role}</span>
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Member Info */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="text-left sm:text-right">
                <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {memberSince}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Responsive for Smartphone, Tablet, PC) */}
        <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-1 rounded-xl sm:rounded-2xl bg-card border p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="truncate">My Posts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span className="truncate">Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="truncate">Security</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="mt-4 rounded-2xl border bg-card p-4 sm:p-8 shadow-xs">
          {activeTab === 'posts' ? (
            /* Tab 1: My Posts Section */
            <MyPostsSection userId={userId} />
          ) : activeTab === 'details' ? (
            /* Tab 2: Profile Details */
            <div>
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Personal Information
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your display name across posts and comments.
                </p>
              </div>

              <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email-display">Email Address (Immutable)</Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed text-xs sm:text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your email address cannot be changed once registered.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    placeholder="Your Name"
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || !name.trim()}
                    className="gap-2 rounded-xl text-xs sm:text-sm font-semibold"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Name'}</span>
                  </Button>
                </div>

                {updateProfileMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Profile updated successfully.</span>
                  </div>
                )}

                {updateProfileMutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{updateProfileErrorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Tab 3: Password & Security */
            <div className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Change Password
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ensure your account is using a long, random password to stay secure.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="prevPassword">Current Password</Label>
                  <PasswordInput
                    id="prevPassword"
                    placeholder="Enter current password"
                    {...register('prevPassword')}
                  />
                  {passwordErrors.prevPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.prevPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    placeholder="Enter new strong password"
                    {...register('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  <PasswordRequirements password={currentNewPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    {...register('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    className="gap-2 rounded-xl text-xs sm:text-sm font-semibold"
                  >
                    {passwordMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{passwordMutation.isPending ? 'Updating Password...' : 'Update Password'}</span>
                  </Button>
                </div>

                {passwordMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Password updated successfully.</span>
                  </div>
                )}

                {passwordMutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}
              </form>

              {/* Danger Zone: Account Deletion */}
              <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-destructive">
                      Delete Account
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                      Permanently delete your account, published stories, and profile data. This action is irreversible.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className="gap-1.5 rounded-xl text-xs font-semibold shrink-0"
                  >
                    {deleteAccountMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>{deleteAccountMutation.isPending ? 'Deleting Account...' : 'Delete My Account'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const mounted = useMounted();
  const { isAuthenticated } = useAuthStore();
  const { data: user, isLoading, isError } = useProfile();

  if (!mounted) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border bg-card p-8 sm:p-10 shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
            <UserIcon className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Sign In to View Profile</h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            You need to be signed in to manage your account details and view your published stories.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button className="gap-2 font-semibold rounded-xl">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="rounded-xl">Create Account</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your profile and stories...</p>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
          <h1 className="text-xl font-bold text-foreground">Failed to load profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please make sure you are logged in and your backend is connected.
          </p>
        </div>
      </main>
    );
  }

  return <ProfileContent user={user} />;
}
