import { z } from 'zod';

export const recommendationCreateSchema = z.object({
  missionId: z.string().uuid(),
  code: z.string().min(1),
  sourceTypeId: z.string().uuid(),
  statusId: z.string().uuid(),
  riskTypeId: z.string().uuid(),
  severityLevelId: z.string().uuid(),
  probabilityLevelId: z.string().uuid(),
  confidentialityLevelId: z.string().uuid(),
  dueDateInitial: z.coerce.date(),
  dueDateRevised: z.coerce.date().optional()
});
