'use client';

import { useMemo, useState } from 'react';
import { applicationFields, importTypes, type ApplicationField } from '@/lib/import/excel-fields';

type PreviewRow = {
  lineNumber: number;
  rawRow: Record<string, unknown>;
  mapped: Record<string, string>;
  errors: string[];
  status: 'VALID' | 'REJECTED';
};

type PreviewResponse = {
  batchId: string;
  headers: string[];
  mapping: Record<ApplicationField, string>;
  rows: PreviewRow[];
  summary: { total: number; valid: number; rejected: number };
};

type Batch = {
  id: string;
  file_name: string;
  import_type: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  rejected_rows: number;
  imported_rows: number;
  created_at: string;
};

export function ImportExcelWorkbench() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<(typeof importTypes)[number]>('recommendations');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Batch[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState('');

  const canConfirm = useMemo(() => preview && preview.summary.valid > 0 && !isConfirming, [preview, isConfirming]);

  async function refreshHistory() {
    const response = await fetch('/api/import-excel/history', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      setHistory(data.batches ?? []);
    }
  }


  async function upload() {
    if (!file) {
      setMessage('Sélectionnez un fichier Excel avant de lancer la prévisualisation.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    setIsUploading(true);
    setMessage('Analyse du fichier en cours…');
    const response = await fetch('/api/import-excel/upload', { method: 'POST', body: formData });
    const data = await response.json();
    setIsUploading(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Erreur pendant le parsing Excel.');
      return;
    }
    setPreview(data);
    setMapping(data.mapping ?? {});
    setMessage('Prévisualisation générée. Vérifiez le mapping et les rejets avant confirmation.');
    await refreshHistory();
  }

  async function confirm() {
    if (!preview) return;
    setIsConfirming(true);
    setMessage('Confirmation de l’import en cours…');
    const response = await fetch('/api/import-excel/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: preview.batchId, mapping }),
    });
    const data = await response.json();
    setIsConfirming(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Erreur pendant la confirmation.');
      return;
    }
    setMessage(`${data.imported} lignes importées. ${data.rejected?.length ?? 0} lignes rejetées.`);
    await refreshHistory();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Fichier Excel .xlsx / .xls
            <input type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-lg border border-slate-300 p-2 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Type d’import
            <select value={importType} onChange={(event) => setImportType(event.target.value as (typeof importTypes)[number])} className="block w-full rounded-lg border border-slate-300 p-2 text-sm">
              <option value="recommendations">Recommandations</option>
              <option value="actions">Actions</option>
              <option value="canevas">Canevas</option>
            </select>
          </label>
          <button onClick={upload} disabled={isUploading} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400">
            {isUploading ? 'Analyse…' : 'Prévisualiser'}
          </button>
        </div>
        {message && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
      </section>

      {preview && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Prévisualisation du batch</h2>
              <p className="text-sm text-slate-600">{preview.summary.total} lignes détectées · {preview.summary.valid} valides · {preview.summary.rejected} rejetées</p>
            </div>
            <button onClick={confirm} disabled={!canConfirm} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400">
              {isConfirming ? 'Import…' : 'Confirmer import'}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {applicationFields.map((field) => (
              <label key={field.key} className="space-y-1 text-xs font-medium text-slate-700">
                {field.label}{field.required && <span className="text-red-600"> *</span>}
                <select value={mapping[field.key] ?? ''} onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value }))} className="block w-full rounded-md border border-slate-300 p-2 text-sm">
                  <option value="">Non mappé</option>
                  {preview.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </label>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
                <tr><th className="p-3">Ligne</th><th className="p-3">Statut</th><th className="p-3">Mission</th><th className="p-3">Recommandation</th><th className="p-3">Owner</th><th className="p-3">Erreurs</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {preview.rows.map((row) => (
                  <tr key={row.lineNumber}>
                    <td className="p-3">{row.lineNumber}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.status === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{row.status}</span></td>
                    <td className="p-3">{row.mapped.missionReference}</td>
                    <td className="max-w-md p-3">{row.mapped.recommendation}</td>
                    <td className="p-3">{row.mapped.owner}</td>
                    <td className="p-3 text-red-700">{row.errors.join(' · ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Historique des imports</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600"><tr><th className="p-3">Fichier</th><th className="p-3">Type</th><th className="p-3">Statut</th><th className="p-3">Total</th><th className="p-3">Importées</th><th className="p-3">Date</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-slate-500">Aucun import enregistré.</td></tr> : history.map((batch) => (
                <tr key={batch.id}><td className="p-3 font-medium">{batch.file_name}</td><td className="p-3">{batch.import_type}</td><td className="p-3">{batch.status}</td><td className="p-3">{batch.total_rows}</td><td className="p-3">{batch.imported_rows ?? 0}</td><td className="p-3">{new Date(batch.created_at).toLocaleString('fr-FR')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
