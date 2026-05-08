'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.session) {
      setIsLoading(false);
      setError(signInError?.message ?? 'Connexion impossible. Vérifiez vos identifiants Supabase Auth.');
      return;
    }

    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresIn: data.session.expires_in }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setIsLoading(false);
      setError(payload?.error ?? 'Session créée côté Supabase, mais impossible de créer le cookie applicatif.');
      return;
    }

    const next = searchParams.get('next') ?? '/dashboard';
    router.replace(next.startsWith('/') ? next : '/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="vous@banque.com" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Mot de passe
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="••••••••" />
      </label>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:bg-slate-400">
        {isLoading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
