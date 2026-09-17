'use client';

import { useProfile } from '@/hooks/use-profile';
import { useEffect, useState } from 'react';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useProfile();
  const [name, setName] = useState('');
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

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header / User Card */}
        <div className="overflow-hidden rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {user.role || 'MEMBER'}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex gap-2 border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === 'details'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>General Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Password & Security</span>
            </button>
          </div>

          {/* Tab 1: General Details */}
          {activeTab === 'details' ? (
            <div className="mt-6 space-y-6">
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="max-w-md cursor-not-allowed opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed directly.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || !name.trim() || name === user.name}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
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
                    <span>
                      {(updateProfileMutation.error as any)?.response?.data?.message ||
                        'Failed to update profile. Please try again.'}
                    </span>
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
                    <span>
                      {(passwordMutation.error as any)?.response?.data?.message ||
                        'Failed to change password. Please verify your current password.'}
                    </span>
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
