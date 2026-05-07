export const importTypes = ['recommendations', 'actions', 'canevas'] as const;

export type ImportType = (typeof importTypes)[number];

export const applicationFields = [
  { key: 'missionReference', label: 'Référence mission', required: true, aliases: ['reference mission', 'référence mission', 'mission', 'mission ref'] },
  { key: 'recommendationCode', label: 'Code recommandation', required: false, aliases: ['code recommandation', 'référence recommandation', 'id recommandation'] },
  { key: 'source', label: 'Source de la recommandation', required: true, aliases: ['source', 'source recommandation', 'origine'] },
  { key: 'entity', label: 'Entité concernée', required: true, aliases: ['entité', 'entite concernee', 'entité concernée', 'direction'] },
  { key: 'recommendation', label: 'Recommandation', required: true, aliases: ['recommandation', 'libellé recommandation', 'libelle recommandation'] },
  { key: 'observation', label: 'Constat / observation', required: true, aliases: ['constat', 'observation', 'constat / observation'] },
  { key: 'risk', label: 'Risque associé', required: true, aliases: ['risque', 'risque associé', 'risk'] },
  { key: 'severity', label: 'Niveau de criticité', required: true, aliases: ['criticité', 'criticite', 'niveau de criticité', 'sévérité'] },
  { key: 'priority', label: 'Priorité', required: true, aliases: ['priorité', 'priorite', 'priority'] },
  { key: 'owner', label: 'Responsable / owner', required: true, aliases: ['responsable', 'owner', 'pilote'] },
  { key: 'dueDateInitial', label: 'Échéance initiale', required: true, aliases: ['échéance initiale', 'echeance initiale', 'date cible'] },
  { key: 'dueDateRevised', label: 'Échéance révisée', required: false, aliases: ['échéance révisée', 'echeance revisee', 'nouvelle échéance'] },
  { key: 'status', label: 'Statut', required: true, aliases: ['statut', 'status', 'état'] },
  { key: 'actionPlan', label: "Plan d’action", required: false, aliases: ['plan action', "plan d'action", 'action plan'] },
  { key: 'expectedDeliverable', label: 'Livrable attendu', required: false, aliases: ['livrable', 'livrable attendu', 'deliverable'] },
  { key: 'comment', label: 'Commentaire', required: false, aliases: ['commentaire', 'commentaires', 'comment'] },
  { key: 'updatedAt', label: 'Date de mise à jour', required: false, aliases: ['date mise à jour', 'date de mise à jour', 'updated at'] },
  { key: 'stakeholder', label: 'Partie prenante', required: false, aliases: ['partie prenante', 'stakeholder', 'contributeur'] },
] as const;

export type ApplicationField = (typeof applicationFields)[number]['key'];

export function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function detectColumnMapping(headers: string[]) {
  return Object.fromEntries(
    applicationFields.map((field) => {
      const normalizedAliases = [field.label, ...field.aliases].map(normalizeHeader);
      const matched = headers.find((header) => normalizedAliases.includes(normalizeHeader(header)));
      return [field.key, matched ?? ''];
    }),
  ) as Record<ApplicationField, string>;
}
