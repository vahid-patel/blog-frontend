"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      const response = await forgotPassword({ email });

      setMessage(response.message);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to process your request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">
          Forgot Password?
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          Enter your email and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}