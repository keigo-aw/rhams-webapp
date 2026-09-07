import { getMeta, setMeta } from './db';

export interface ExportLogEntry {
  filename: string;
  exportedAt: number;
}

const EXPORT_LOG_KEY = 'exportLog';
const MAX_ENTRIES = 5;

export async function loadExportLog(): Promise<ExportLogEntry[]> {
  const log = await getMeta<ExportLogEntry[]>(EXPORT_LOG_KEY);
  return log ?? [];
}

export async function recordExport(filename: string): Promise<void> {
  const log = await loadExportLog();
  const next = [{ filename, exportedAt: Date.now() }, ...log].slice(0, MAX_ENTRIES);
  await setMeta(EXPORT_LOG_KEY, next);
}
