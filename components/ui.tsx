import type { ReactNode } from 'react';

export function KpiCard({ label, value, hint, tone = 'slate' }: { label: string; value: string; hint: string; tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'red' }) {
  const tones = { slate: 'bg-slate-900', blue: 'bg-blue-700', emerald: 'bg-emerald-700', amber: 'bg-amber-600', red: 'bg-red-700' };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-4 h-2 w-14 rounded-full ${tones[tone]}`} /><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p><p className="mt-2 text-sm text-slate-600">{hint}</p></article>;
}

export function StatusBadge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'red' | 'purple' }) {
  const tones = { slate: 'bg-slate-100 text-slate-700', blue: 'bg-blue-100 text-blue-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700', purple: 'bg-purple-100 text-purple-700' };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function DataTable({ columns, rows, empty }: { columns: string[]; rows: ReactNode[][]; empty: string }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-4"><input className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Recherche, filtre, tri…" /></div><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-100 text-left text-xs uppercase text-slate-600"><tr>{columns.map((column) => <th key={column} className="p-3 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length === 0 ? <tr><td colSpan={columns.length} className="p-8 text-center text-slate-500">{empty}</td></tr> : rows.map((row, index) => <tr key={index} className="hover:bg-slate-50">{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 align-top">{cell}</td>)}</tr>)}</tbody></table><div className="flex items-center justify-between border-t border-slate-200 p-3 text-xs text-slate-500"><span>Pagination prête pour branchement backend</span><span>25 lignes par page</span></div></div>;
}
