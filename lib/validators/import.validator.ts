import { z } from 'zod';
import { applicationFields, importTypes } from '@/lib/import/excel-fields';

export const importTypeSchema = z.enum(importTypes);
export const mappingSchema = z.record(z.string(), z.string());

export const parsedRecommendationRowSchema = z.object({
  missionReference: z.string().min(1, 'Référence mission obligatoire'),
  recommendationCode: z.string().optional(),
  source: z.string().min(1, 'Source obligatoire'),
  entity: z.string().min(1, 'Entité obligatoire'),
  recommendation: z.string().min(1, 'Recommandation obligatoire'),
  observation: z.string().min(1, 'Constat obligatoire'),
  risk: z.string().min(1, 'Risque obligatoire'),
  severity: z.string().min(1, 'Criticité obligatoire'),
  priority: z.string().min(1, 'Priorité obligatoire'),
  owner: z.string().min(1, 'Responsable obligatoire'),
  dueDateInitial: z.string().min(1, 'Échéance initiale obligatoire'),
  dueDateRevised: z.string().optional(),
  status: z.string().min(1, 'Statut obligatoire'),
  actionPlan: z.string().optional(),
  expectedDeliverable: z.string().optional(),
  comment: z.string().optional(),
  updatedAt: z.string().optional(),
  stakeholder: z.string().optional(),
});

export const uploadImportSchema = z.object({
  importType: importTypeSchema,
});

export const confirmImportSchema = z.object({
  batchId: z.string().uuid(),
  mapping: z.record(z.enum(applicationFields.map((field) => field.key) as [string, ...string[]]), z.string()).optional(),
});
