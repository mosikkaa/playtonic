"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-3xl font-semibold mb-2">Log in</h1>
      <p className="text-gray-500 mb-8">
        We'll send you a magic link to your email
      </p>

      {submitted ? (
        <div className="border border-gray-200 rounded-xl p-6 text-center">
          <p className="font-medium mb-1">Check your email</p>
          <p className="text-gray-500 text-sm">
            We sent a link to <span className="text-black">{email}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>
      )}
    </main>
  );
}
