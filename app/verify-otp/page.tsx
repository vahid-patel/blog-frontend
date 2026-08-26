"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { verifyOtp } from "@/services/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is missing.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await verifyOtp({
        email,
        otp,
      });

      router.push("/login");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">
          Verify your email
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          We sent an OTP to{" "}
          <span className="font-medium text-gray-900">
            {email}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="mb-1 block text-sm font-medium"
            >
              OTP
            </label>

            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              className="w-full rounded-lg border px-3 py-2 text-center tracking-widest"
            />
          </div>

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
              ? "Verifying..."
              : "Verify Email"}
          </button>
        </form>
      </div>
    </main>
  );
}