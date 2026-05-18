import { CrudWorkspace } from '@/components/crud-workspace';
import { listWorkspaceRows, workspaceConfigs, type WorkspaceResource } from '@/lib/workspace/resources';

export async function WorkspacePage({ resource, heading, intro }: { resource: WorkspaceResource; heading: string; intro: string }) {
  const config = workspaceConfigs[resource];
  const result = await listWorkspaceRows(resource, { page: 1, pageSize: 25 });
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">{heading}</h1>
        <p className="mt-2 text-slate-600">{intro}</p>
      </div>
      <CrudWorkspace
        title={config.title}
        description={config.description}
        fields={config.fields}
        initialRows={result.rows}
        columns={config.columns}
        statusField={config.statusField}
        readonly={config.readonly}
        enabledViews={config.enabledViews}
        apiEndpoint={`/api/workspace/${resource}`}
        totalRows={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </section>
  );
}
