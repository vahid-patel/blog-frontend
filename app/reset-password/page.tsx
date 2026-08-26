"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token || !userId) {
      setError("Invalid or incomplete reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await resetPassword({
        userId,
        token,
        newPassword,
      });

      setMessage(response.message);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">
          Reset Password
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}