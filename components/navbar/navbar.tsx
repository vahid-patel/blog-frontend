'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  PenSquare,
  User as UserIcon,
  LogOut,
  Compass,
  Home as HomeIcon,
  Menu,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthStore } from '@/store/auth-store';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    // Reload the app completely to clear cached states & return to root
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Left Side: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 md:hidden text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-sm">
              B
            </span>
            <span className="truncate">BlogSocial</span>
          </Link>

          {/* Nav Links (Desktop & Tablet landscape) */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Feed</span>
            </Link>

            <Link
              href="/search"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/search') || pathname.startsWith('/posts') && !pathname.startsWith('/posts/create')
                  ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </Link>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Write / Create Post Button */}
          <Link href="/create-post">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex items-center gap-1.5 font-medium border-dashed hover:border-solid rounded-xl"
            >
              <PenSquare className="h-4 w-4" />
              <span>Write</span>
            </Button>
          </Link>

          {/* Auth State Handling */}
          {!mounted ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/70 p-1 sm:pr-2.5 text-sm font-medium transition hover:bg-accent focus:outline-none">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-2xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="hidden max-w-[100px] sm:max-w-[130px] truncate text-xs font-medium sm:inline-block sm:text-sm">
                  {user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 p-1">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push('/create-post')}
                  className="cursor-pointer sm:hidden rounded-lg font-medium"
                >
                  <PenSquare className="mr-2 h-4 w-4 text-primary" />
                  <span>Write Post</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="cursor-pointer rounded-lg font-medium"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-primary" />
                  <span>My Profile & Posts</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer rounded-lg font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="border-b bg-card px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Community Feed</span>
            </Link>

            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/search')
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Explore Topics & Search</span>
            </Link>

            <Link
              href="/create-post"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                pathname === '/create-post'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <PenSquare className="h-4 w-4 text-primary" />
              <span>Write New Post</span>
            </Link>

            {isAuthenticated && user && (
              <>
                <div className="my-1 border-t border-border/60" />
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="h-4 w-4" />
                    <span>My Profile & Posts</span>
                  </div>
                  <span className="text-[11px] rounded-full bg-primary/20 px-2 py-0.5 font-bold">
                    {user.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

