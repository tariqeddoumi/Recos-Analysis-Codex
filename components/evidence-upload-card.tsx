'use client';

import { useState, useTransition, type FormEvent } from 'react';

export function EvidenceUploadCard() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch('/api/evidences/upload', { method: 'POST', body: formData });
      const payload = await response.json();
      setMessage(response.ok ? `Preuve déposée v${payload.version} · hash ${payload.fileHash}` : payload.error);
      if (response.ok) form.reset();
    });
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Upload Supabase Storage avec versioning</h2>
      <p className="mt-1 text-sm text-slate-600">Dépose un justificatif, calcule son hash SHA-256, versionne automatiquement et trace l’action dans l’audit log.</p>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-4">
        <input name="recommendationCode" required placeholder="Code recommandation" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="title" required placeholder="Titre du document" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="file" required type="file" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button disabled={isPending} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Uploader</button>
      </form>
      {message ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
    </article>
  );
}
