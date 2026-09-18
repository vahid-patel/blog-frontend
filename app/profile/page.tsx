'use client';

import { useProfile } from '@/hooks/use-profile';
import type { UserProfile } from '@/services/users';
import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useAuthStore } from '@/store/auth-store';
import { useMounted } from '@/hooks/use-mounted';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  passwordChangeSchema,
  PasswordChangeFormData,
} from '@/lib/validations/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';

function ProfileContent({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name || '');
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  const updateProfileMutation = useUpdateProfile();
  const passwordMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

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
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header / User Card */}
        <div className="overflow-hidden rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <BadgeCheck className="h-3 w-3" />
                    <span>{user.role}</span>
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Member Since badge */}
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Member Since
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex rounded-xl bg-card border p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
          {activeTab === 'details' ? (
            /* Tab 1: Profile Details */
            <div>
              <div className="mb-6">
                <h2 className="text-base font-bold text-foreground">
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
                    className="bg-muted text-muted-foreground cursor-not-allowed"
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
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || !name.trim()}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Name'}</span>
                  </Button>
                </div>

                {updateProfileMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Profile updated successfully.</span>
                  </div>
                )}

                {updateProfileMutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{updateProfileErrorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Tab 2: Password & Security */
            <div className="mt-6 space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="h-5 w-5 text-primary mt-0.5" />
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
                  <Input
                    id="prevPassword"
                    type="password"
                    placeholder="••••••••"
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
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
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
                    className="gap-2"
                  >
                    {passwordMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{passwordMutation.isPending ? 'Updating Password...' : 'Update Password'}</span>
                  </Button>
                </div>

                {passwordMutation.isSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Password updated successfully.</span>
                  </div>
                )}

                {passwordMutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}
              </form>
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
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
            <UserIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sign In to View Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be signed in to manage your account details and security settings.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button className="gap-2 font-semibold">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create Account</Button>
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
          <p className="text-sm font-medium">Loading your profile...</p>
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
