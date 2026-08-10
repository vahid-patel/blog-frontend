import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900"
        >
          Blog
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Home
          </Link>

          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Explore
          </Link>

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
        </div>
      </nav>
    </header>
  );
}