import assert from 'node:assert/strict';
import test from 'node:test';
import { detectColumnMapping, normalizeHeader } from '@/lib/import/excel-fields';

test('normalizeHeader removes accents and punctuation', () => {
  assert.equal(normalizeHeader('Échéance révisée / Owner'), 'echeance revisee owner');
});

test('detectColumnMapping maps common Excel headers to application fields', () => {
  const mapping = detectColumnMapping(['Référence mission', 'Entité concernée', 'Recommandation', 'Responsable', 'Statut']);
  assert.equal(mapping.missionReference, 'Référence mission');
  assert.equal(mapping.entity, 'Entité concernée');
  assert.equal(mapping.recommendation, 'Recommandation');
  assert.equal(mapping.owner, 'Responsable');
  assert.equal(mapping.status, 'Statut');
});
