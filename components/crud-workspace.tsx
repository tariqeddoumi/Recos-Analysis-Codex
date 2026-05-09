'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { StatusBadge } from '@/components/ui';

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'email';

type CrudTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'red' | 'purple';

export type CrudField = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type CrudRecord = Record<string, string> & { id: string };

export type CrudView = 'create' | 'read' | 'update' | 'delete' | 'export' | 'audit';

export function CrudWorkspace({
  title,
  description,
  fields,
  initialRows,
  columns,
  statusField,
  readonly = false,
  enabledViews = ['create', 'read', 'update', 'delete', 'export'],
  children,
}: {
  title: string;
  description: string;
  fields: CrudField[];
  initialRows: CrudRecord[];
  columns?: string[];
  statusField?: string;
  readonly?: boolean;
  enabledViews?: CrudView[];
  children?: ReactNode;
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CrudRecord>(() => buildEmptyDraft(fields));
  const [sortKey, setSortKey] = useState(fields[0]?.key ?? 'id');

  const visibleColumns = columns ?? fields.map((field) => field.key);
  const canCreate = enabledViews.includes('create') && !readonly;
  const canUpdate = enabledViews.includes('update') && !readonly;
  const canDelete = enabledViews.includes('delete') && !readonly;
  const canExport = enabledViews.includes('export');

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows
      .filter((row) => !normalizedQuery || Object.values(row).some((value) => value.toLowerCase().includes(normalizedQuery)))
      .sort((a, b) => (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'fr'));
  }, [query, rows, sortKey]);

  function resetDraft() {
    setEditingId(null);
    setDraft(buildEmptyDraft(fields));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate && !canUpdate) return;

    if (editingId) {
      setRows((currentRows) => currentRows.map((row) => (row.id === editingId ? { ...row, ...draft, id: editingId } : row)));
    } else {
      setRows((currentRows) => [{ ...draft, id: crypto.randomUUID() }, ...currentRows]);
    }
    resetDraft();
  }

  function startEdit(row: CrudRecord) {
    setEditingId(row.id);
    setDraft({ ...buildEmptyDraft(fields), ...row });
  }

  function deleteRow(id: string) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
    if (editingId === id) resetDraft();
  }

  function exportCsv() {
    const csvRows = [visibleColumns.map((key) => findField(fields, key)?.label ?? key).join(';')]
      .concat(filteredRows.map((row) => visibleColumns.map((key) => escapeCsv(row[key] ?? '')).join(';')))
      .join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {enabledViews.map((view) => (
                <StatusBadge key={view} tone={viewTone[view]}>{viewLabels[view]}</StatusBadge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canExport ? <button type="button" onClick={exportCsv} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Exporter CSV</button> : null}
            {!readonly ? <button type="button" onClick={resetDraft} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Nouveau</button> : null}
          </div>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </article>

      {!readonly ? (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">{editingId ? 'Modifier un enregistrement' : 'Créer un enregistrement'}</h3>
              <p className="text-sm text-slate-500">Validation HTML5, champs obligatoires et valeurs normalisées pour préparer le branchement API.</p>
            </div>
            {editingId ? <button type="button" onClick={resetDraft} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Annuler</button> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2 xl:col-span-3' : ''}>
                <span className="text-sm font-medium text-slate-700">{field.label}{field.required ? ' *' : ''}</span>
                <FieldInput field={field} value={draft[field.key] ?? ''} onChange={(value) => setDraft((currentDraft) => ({ ...currentDraft, [field.key]: value }))} />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">{editingId ? 'Enregistrer les modifications' : 'Ajouter'}</button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Recherche multi-colonnes…" />
          <label className="flex items-center gap-2 text-sm text-slate-600">Tri
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {visibleColumns.map((key) => <option key={key} value={key}>{findField(fields, key)?.label ?? key}</option>)}
            </select>
          </label>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
            <tr>
              {visibleColumns.map((key) => <th key={key} className="p-3 font-semibold">{findField(fields, key)?.label ?? key}</th>)}
              {(canUpdate || canDelete || readonly) ? <th className="p-3 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length === 0 ? (
              <tr><td colSpan={visibleColumns.length + 1} className="p-8 text-center text-slate-500">Aucun enregistrement.</td></tr>
            ) : filteredRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {visibleColumns.map((key) => <td key={key} className="p-3 align-top">{key === statusField ? <StatusBadge tone={statusTone(row[key])}>{row[key]}</StatusBadge> : row[key]}</td>)}
                {(canUpdate || canDelete || readonly) ? (
                  <td className="min-w-40 p-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {readonly ? <StatusBadge tone="blue">Lecture seule</StatusBadge> : null}
                      {canUpdate ? <button type="button" onClick={() => startEdit(row)} className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">Modifier</button> : null}
                      {canDelete ? <button type="button" onClick={() => deleteRow(row.id)} className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Supprimer</button> : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 p-3 text-xs text-slate-500">
          <span>{filteredRows.length} ligne(s) affichée(s) / {rows.length}</span>
          <span>CRUD local prêt à remplacer par API routes + Prisma</span>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: CrudField; value: string; onChange: (value: string) => void }) {
  const commonProps = {
    value,
    required: field.required,
    placeholder: field.placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
    className: 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100',
  };

  if (field.type === 'textarea') return <textarea {...commonProps} rows={3} />;
  if (field.type === 'select') return <select {...commonProps}><option value="">Sélectionner…</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  return <input {...commonProps} type={field.type ?? 'text'} />;
}

function buildEmptyDraft(fields: CrudField[]): CrudRecord {
  return fields.reduce<CrudRecord>((draft, field) => ({ ...draft, [field.key]: '' }), { id: '' });
}

function findField(fields: CrudField[], key: string) {
  return fields.find((field) => field.key === key);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function statusTone(value?: string): CrudTone {
  const normalized = value?.toLowerCase() ?? '';
  if (normalized.includes('retard') || normalized.includes('rejet') || normalized.includes('bloqu')) return 'red';
  if (normalized.includes('attente') || normalized.includes('prorog') || normalized.includes('brouillon')) return 'amber';
  if (normalized.includes('valid') || normalized.includes('clôt') || normalized.includes('réalis') || normalized.includes('actif')) return 'emerald';
  if (normalized.includes('cours') || normalized.includes('ouverte') || normalized.includes('traç')) return 'blue';
  return 'slate';
}

const viewLabels: Record<CrudView, string> = {
  create: 'Créer',
  read: 'Lire',
  update: 'Modifier',
  delete: 'Supprimer',
  export: 'Exporter',
  audit: 'Auditer',
};

const viewTone: Record<CrudView, CrudTone> = {
  create: 'blue',
  read: 'slate',
  update: 'amber',
  delete: 'red',
  export: 'emerald',
  audit: 'purple',
};
