'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

import { login } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { getProfile } from '@/services/users';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginUser = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);

      // 1. Save JWT
      loginUser(response.token);

      // 2. Use JWT to get authenticated user
      const profile = await getProfile();

      // 3. Save user
      setUser(profile);

      console.log('Login successful');
      console.log('Authenticated user:', profile);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Login to continue to your account
          </p>
        </div>
        <p className="mt-4 text-center">
          Authenticated: {isAuthenticated ? 'Yes' : 'No'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />

            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
            />

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        {/* Signup */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-foreground underline"
          >
            Sign up
          </Link>
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </main>
  );
}
