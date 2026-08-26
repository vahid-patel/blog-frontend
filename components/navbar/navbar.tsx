'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          Blog
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Home
          </Link>

          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Explore
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>

                <span>{user?.name}</span>

                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem>Settings</DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
