import { WorkspacePage } from '@/components/workspace-page';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <WorkspacePage resource="audit-log" heading="Audit log" intro="Journal bancaire immuable des imports, mappings, validations, changements de statut et opérations sensibles." />;
}
