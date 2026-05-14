import { WorkspacePage } from '@/components/workspace-page';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <WorkspacePage resource="missions" heading="Missions" intro="Pilotage complet des missions sources, entités responsables, confidentialité et rattachement des recommandations." />;
}
