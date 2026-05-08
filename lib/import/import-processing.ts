import { applicationFields, type ApplicationField } from '@/lib/import/excel-fields';
import { parsedRecommendationRowSchema } from '@/lib/validators/import.validator';

export type RawImportRow = Record<string, unknown>;

export type ValidatedImportRow = {
  lineNumber: number;
  rawRow: RawImportRow;
  mapped: Record<ApplicationField, string>;
  errors: string[];
  status: 'VALID' | 'REJECTED';
};

function stringifyCell(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value === null || value === undefined ? '' : String(value).trim();
}

export function applyColumnMapping(rawRow: RawImportRow, mapping: Record<string, string>) {
  return Object.fromEntries(
    applicationFields.map((field) => {
      const column = mapping[field.key];
      return [field.key, column ? stringifyCell(rawRow[column]) : ''];
    }),
  ) as Record<ApplicationField, string>;
}

export function validateImportRows(rows: RawImportRow[], mapping: Record<string, string>, lineOffset = 2): ValidatedImportRow[] {
  const seen = new Set<string>();

  return rows.map((rawRow, index) => {
    const mapped = applyColumnMapping(rawRow, mapping);
    const parsed = parsedRecommendationRowSchema.safeParse(mapped);
    const errors = parsed.success ? [] : parsed.error.issues.map((issue) => issue.message);
    const duplicateKey = [mapped.recommendationCode, mapped.missionReference, mapped.recommendation]
      .filter(Boolean)
      .join('|')
      .toLowerCase();

    if (duplicateKey && seen.has(duplicateKey)) errors.push('Doublon détecté dans le fichier');
    if (duplicateKey) seen.add(duplicateKey);

    return {
      lineNumber: index + lineOffset,
      rawRow,
      mapped,
      errors,
      status: errors.length ? 'REJECTED' : 'VALID',
    };
  });
}

export function summarizeRows(rows: Pick<ValidatedImportRow, 'status'>[]) {
  return {
    total: rows.length,
    valid: rows.filter((row) => row.status === 'VALID').length,
    rejected: rows.filter((row) => row.status === 'REJECTED').length,
  };
}
