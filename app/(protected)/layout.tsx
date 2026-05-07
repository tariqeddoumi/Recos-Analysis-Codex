import Link from 'next/link';
import { ReactNode } from 'react';

const navigation = [
  ['Dashboard', '/dashboard'], ['Missions', '/missions'], ['Recommandations', '/recommendations'], ['Actions', '/actions'], ['Preuves', '/evidences'], ['Import Excel', '/import-excel'], ['Reporting', '/reports'], ['Administration', '/admin'], ['Audit log', '/audit-log'],
];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <aside className="bg-slate-950 p-6 text-white">
        <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-blue-200">Banque · Contrôle permanent</p><h1 className="mt-2 text-xl font-bold">Suivi Recos</h1></div>
        <nav className="mt-8 space-y-1">{navigation.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white">{label}</Link>)}</nav>
        <form action="/api/auth/signout" method="post" className="mt-8">
          <button className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white">Déconnexion</button>
        </form>
        <div className="mt-8 rounded-xl border border-white/10 p-4 text-xs text-slate-300"><p className="font-semibold text-white">Sécurité</p><p className="mt-1">Pages protégées par Supabase Auth, RBAC et RLS côté backend.</p></div>
      </aside>
      <main className="min-w-0 p-6">{children}</main>
    </div>
  );
}
