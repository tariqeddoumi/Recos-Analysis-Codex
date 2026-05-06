export function read(data: Buffer, options?: { type?: string; cellDates?: boolean }): { SheetNames: string[]; Sheets: Record<string, unknown> };
export const utils: { sheet_to_json(sheet: unknown, options?: { defval?: string; raw?: boolean }): Record<string, unknown>[] };
