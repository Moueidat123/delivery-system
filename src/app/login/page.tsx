"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Wrong access code.");
      }
      // Success — go to the dashboard.
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong access code.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl">
            🚚
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery System</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your access code to continue.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}
          <div>
            <label className="label">🔒 Access Code</label>
            <input
              className="input text-center text-lg tracking-widest"
              type="password"
              inputMode="text"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Checking..." : "Unlock"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Only people with the code can view this page.
        </p>
      </div>
    </main>
  );
}
