import assert from 'node:assert/strict';
import test from 'node:test';
import { validateImportRows } from '@/lib/import/import-processing';

const mapping = {
  missionReference: 'Mission',
  recommendationCode: 'Code',
  source: 'Source',
  entity: 'Entité',
  recommendation: 'Recommandation',
  observation: 'Constat',
  risk: 'Risque',
  severity: 'Criticité',
  priority: 'Priorité',
  owner: 'Owner',
  dueDateInitial: 'Échéance',
  dueDateRevised: '',
  status: 'Statut',
  actionPlan: '',
  expectedDeliverable: '',
  comment: '',
  updatedAt: '',
  stakeholder: '',
};

test('validateImportRows rejects incomplete rows and keeps raw data', () => {
  const rows = validateImportRows([{ Mission: 'M-1', Code: 'R-1' }], mapping);

  assert.equal(rows[0].status, 'REJECTED');
  assert.equal(rows[0].rawRow.Mission, 'M-1');
  assert.match(rows[0].errors.join(' '), /Source obligatoire/);
});

test('validateImportRows detects duplicate recommendation keys inside the uploaded file', () => {
  const rows = validateImportRows([
    { Mission: 'M-1', Code: 'R-1', Source: 'Audit', Entité: 'Risques', Recommandation: 'Faire A', Constat: 'Constat', Risque: 'Opérationnel', Criticité: 'Haute', Priorité: 'P1', Owner: 'Alice', Échéance: '2026-06-30', Statut: 'Ouverte' },
    { Mission: 'M-1', Code: 'R-1', Source: 'Audit', Entité: 'Risques', Recommandation: 'Faire A', Constat: 'Constat', Risque: 'Opérationnel', Criticité: 'Haute', Priorité: 'P1', Owner: 'Alice', Échéance: '2026-06-30', Statut: 'Ouverte' },
  ], mapping);

  assert.equal(rows[0].status, 'VALID');
  assert.equal(rows[1].status, 'REJECTED');
  assert.match(rows[1].errors.join(' '), /Doublon/);
});
