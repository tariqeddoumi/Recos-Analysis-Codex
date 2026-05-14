import { WorkspacePage } from '@/components/workspace-page';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <WorkspacePage resource="admin" heading="Administration" intro="Paramétrage RBAC, workflows, mappings Excel, canevas, règles de relance et référentiels." />;
}
