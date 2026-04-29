import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
          <aside className="bg-slate-900 text-white p-6">Suivi Recommandations</aside>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
