'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      password: formData.get('password'),
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('Invalid password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="password"
        type="password"
        placeholder="Admin password"
        required
        autoFocus
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the admin password to continue</p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
