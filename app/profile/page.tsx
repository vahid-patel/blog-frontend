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

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useProfile();
  const [name, setName] = useState('');

  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const passwordMutation = useUpdateProfile();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (isLoading) {
    return <div className="mx-auto max-w-3xl p-6">Loading profile...</div>;
  }

  if (isError || !user) {
    return <div className="mx-auto max-w-3xl p-6">Failed to load profile.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{user.role}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Edit Profile</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            updateProfileMutation.mutate({
              name,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {updateProfileMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Profile updated successfully.
            </p>
          )}

          {updateProfileMutation.isError && (
            <p className="text-sm text-red-600">Failed to update profile.</p>
          )}
        </form>
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

        <form
          onSubmit={handleSubmit((data) => {
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
          })}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Current Password
            </label>

            <input
              type="password"
              {...register('prevPassword')}
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.prevPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.prevPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              New Password
            </label>

            <input
              type="password"
              {...register('newPassword')}
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm New Password
            </label>

            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
          </button>

          {passwordMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Password changed successfully.
            </p>
          )}

          {passwordMutation.isError && (
            <p className="text-sm text-red-600">
              Failed to change password. Check your current password.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
