import { WorkspacePage } from '@/components/workspace-page';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <WorkspacePage resource="actions" heading="Plans d’action" intro="Suivi opérationnel des plans, responsables, jalons, preuves attendues et avancement pondéré." />;
}
