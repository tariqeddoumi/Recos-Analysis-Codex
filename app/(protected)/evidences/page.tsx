import { WorkspacePage } from '@/components/workspace-page';
import { EvidenceUploadCard } from '@/components/evidence-upload-card';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <section className="space-y-6">
      <EvidenceUploadCard />
      <WorkspacePage resource="evidences" heading="Preuves et justificatifs" intro="Catalogue des pièces jointes versionnées, hashées et rattachées aux recommandations ou actions." />
    </section>
  );
}
