import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';

const fields: CrudField[] = [
  { key: 'recommendation', label: 'Reco', required: true },
  { key: 'title', label: 'Document', required: true },
  { key: 'storagePath', label: 'Stockage', required: true, placeholder: 'Supabase Storage / bucket / chemin' },
  { key: 'validationStatus', label: 'Validation', type: 'select', required: true, options: ['À valider', 'Validée', 'Rejetée', 'Version obsolète'] },
  { key: 'version', label: 'Version', type: 'number', required: true },
  { key: 'uploadedBy', label: 'Déposé par', required: true },
  { key: 'fileHash', label: 'Hash fichier' },
];

const rows: CrudRecord[] = [
  { id: 'evidence-1', recommendation: 'REC-2026-001', title: 'Procédure KYC v2.pdf', storagePath: 'Supabase Storage', validationStatus: 'À valider', version: '1', uploadedBy: 'Responsable Conformité', fileHash: 'sha256:demo-kyc' },
  { id: 'evidence-2', recommendation: 'REC-2026-003', title: 'PV comité.docx', storagePath: 'Supabase Storage', validationStatus: 'Validée', version: '2', uploadedBy: 'Secrétariat comité', fileHash: 'sha256:demo-pv' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Preuves et justificatifs</h1>
        <p className="mt-2 text-slate-600">Catalogue des pièces jointes versionnées, hashées et rattachées aux recommandations ou actions.</p>
      </div>
      <CrudWorkspace title="CRUD des preuves" description="Ajouter des preuves, modifier le statut de validation, supprimer une version erronée et exporter le catalogue documentaire." fields={fields} initialRows={rows} columns={['recommendation', 'title', 'storagePath', 'validationStatus', 'version']} statusField="validationStatus" />
    </section>
  );
}
