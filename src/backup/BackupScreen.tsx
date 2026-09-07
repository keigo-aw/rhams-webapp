import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Kicker } from '../ui/Kicker';
import { Table } from '../ui/Table';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { PanelPortal } from '../shell/PanelSlot';
import { getStorageStats, formatBytes, type StorageStats } from '../persistence/storageStats';
import { loadExportLog, recordExport, type ExportLogEntry } from '../persistence/exportLog';
import {
  applyImport,
  buildExport,
  downloadExport,
  loadDataSummary,
  parseExportFile,
  resetWorkspace,
  type DataSummary,
} from './exportImport';

export function BackupScreen() {
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [exportLog, setExportLog] = useState<ExportLogEntry[]>([]);
  const [status, setStatus] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => {
    loadDataSummary().then(setSummary).catch((err) => console.error('Failed to load data summary', err));
    getStorageStats().then(setStats).catch((err) => console.error('Failed to read storage stats', err));
    loadExportLog().then(setExportLog).catch((err) => console.error('Failed to load export log', err));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setStatus(null);
    try {
      const data = await buildExport();
      const filename = downloadExport(data);
      await recordExport(filename);
      setStatus({ kind: 'info', text: 'Backup file downloaded.' });
      refresh();
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Export failed.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setStatus(null);
    try {
      const text = await file.text();
      const data = parseExportFile(text);
      const confirmed = window.confirm(
        `Import this backup?\n\n` +
          `Current plan: ${data.currentPlan ? 'included' : 'none'}\n` +
          `Plan history: ${data.planHistory.length} record(s)\n` +
          `Survey history: ${data.surveyHistory.length} record(s)\n\n` +
          `This replaces all data currently stored in this browser. This cannot be undone.`,
      );
      if (!confirmed) return;

      setIsImporting(true);
      await applyImport(data);
      setStatus({ kind: 'info', text: 'Import complete. Reloading…' });
      window.location.reload();
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Import failed.' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetWorkspace = async () => {
    setConfirmReset(false);
    await resetWorkspace();
    window.location.reload();
  };

  const quotaLabel =
    stats && stats.quotaUsageBytes !== null && stats.quotaTotalBytes !== null
      ? `${formatBytes(stats.quotaUsageBytes)} of ${formatBytes(stats.quotaTotalBytes)}`
      : '—';

  return (
    <>
      <div className="blueprint" style={{ maxWidth: 560, padding: '26px 28px' }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <Kicker style={{ margin: '0 0 6px' }}>Data management</Kicker>
        <h3 style={{ margin: '0 0 12px' }}>Export &amp; import</h3>
        <p style={{ fontSize: 14, maxWidth: '46ch', color: 'color-mix(in srgb, var(--color-text) 75%, transparent)' }}>
          Back up every waypoint plan and survey record held in this browser to a single JSON file, or restore a
          previously exported file when moving to another workstation.
        </p>

        <Kicker style={{ margin: '20px 0 8px' }}>Currently stored</Kicker>
        <Table>
          <tbody>
            <tr>
              <td>Current plan</td>
              <td className="num">{summary ? (summary.hasCurrentPlan ? 'present' : 'none') : '—'}</td>
            </tr>
            <tr>
              <td>Confirmed plan history</td>
              <td className="num">{summary ? `${summary.planHistoryCount} record(s)` : '—'}</td>
            </tr>
            <tr>
              <td>Survey history</td>
              <td className="num">{summary ? `${summary.surveyHistoryCount} record(s)` : '—'}</td>
            </tr>
          </tbody>
        </Table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 22 }}>
          <div>
            <Kicker style={{ margin: '0 0 6px' }}>Export</Kicker>
            <p style={{ fontSize: 13, margin: '0 0 10px', color: 'color-mix(in srgb, var(--color-text) 65%, transparent)' }}>
              One JSON file containing everything above.
            </p>
            <Button
              variant="primary"
              block
              style={{ minHeight: 44, textAlign: 'center' }}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting…' : 'Export all data'}
            </Button>
          </div>
          <div>
            <Kicker style={{ margin: '0 0 6px' }}>Import</Kicker>
            <p style={{ fontSize: 13, margin: '0 0 10px', color: 'color-mix(in srgb, var(--color-text) 65%, transparent)' }}>
              Replaces all data currently stored in this browser.
            </p>
            <Button
              variant="secondary"
              block
              style={{ minHeight: 44, textAlign: 'center' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? 'Importing…' : 'Import backup'}
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>

        {status && (
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: status.kind === 'error' ? 'var(--color-danger)' : 'color-mix(in srgb, var(--color-text) 65%, transparent)',
            }}
          >
            {status.text}
          </p>
        )}
      </div>

      <PanelPortal>
      <div>
        <Kicker style={{ margin: '0 0 8px' }}>Storage</Kicker>
        <Table>
          <tbody>
            <tr>
              <td>Waypoint plans</td>
              <td className="num">{stats ? formatBytes(stats.waypointPlanBytes) : '—'}</td>
            </tr>
            <tr>
              <td>Survey records</td>
              <td className="num">{stats ? formatBytes(stats.surveyRecordBytes) : '—'}</td>
            </tr>
            <tr>
              <td>Browser quota used</td>
              <td className="num">{quotaLabel}</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div>
        <Kicker style={{ margin: '0 0 8px' }}>Recent exports</Kicker>
        {exportLog.length === 0 ? (
          <p style={{ fontSize: 12, margin: 0, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
            No exports yet this session.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {exportLog.map((entry) => (
              <div
                key={entry.filename + entry.exportedAt}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: 12,
                  borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
                }}
              >
                <span className="num">{entry.filename}</span>
                <span className="num" style={{ color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
                  {new Date(entry.exportedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="blueprint" style={{ padding: 12 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <Kicker style={{ margin: '0 0 6px', color: 'var(--color-danger)' }}>Destructive</Kicker>
        <p style={{ fontSize: 12, margin: '0 0 10px', color: 'color-mix(in srgb, var(--color-text) 65%, transparent)' }}>
          Clears every plan and survey record held in this browser. Export first — this cannot be undone.
        </p>
        <Button variant="secondary" block danger onClick={() => setConfirmReset(true)}>
          Reset workspace
        </Button>
      </div>
      </PanelPortal>

      {confirmReset && (
        <Dialog
          title="Reset workspace?"
          onBackdropClick={() => setConfirmReset(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button variant="secondary" danger onClick={handleResetWorkspace}>
                Reset workspace
              </Button>
            </>
          }
        >
          This clears every plan and survey record held in this browser. Export a backup first — this cannot be
          undone.
        </Dialog>
      )}
    </>
  );
}
