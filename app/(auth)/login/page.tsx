import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Accès sécurisé</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Connexion</h1>
        <p className="mt-2 text-sm text-slate-600">
          Connectez-vous avec un utilisateur créé dans Supabase Auth. Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` doivent être disponibles côté client.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-slate-500">Chargement du formulaire…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
