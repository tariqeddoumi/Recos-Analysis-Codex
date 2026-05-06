import { ImportExcelWorkbench } from '@/components/import-excel-workbench';

export default function ImportExcelPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Import contrôlé</p>
        <h1 className="text-3xl font-bold text-slate-950">Import Excel des recommandations</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Chargez un fichier Excel, vérifiez la détection des colonnes, corrigez le mapping si besoin, consultez les erreurs ligne par ligne puis confirmez l’intégration dans le workflow métier.
        </p>
      </div>
      <ImportExcelWorkbench />
    </section>
  );
}
