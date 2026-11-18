import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { applyImport, buildExport, downloadExport, loadDataSummary, parseExportFile, type DataSummary } from './exportImport';

export function BackupScreen() {
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [status, setStatus] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshSummary = () => {
    loadDataSummary()
      .then(setSummary)
      .catch((err) => console.error('Failed to load data summary', err));
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setStatus(null);
    try {
      const data = await buildExport();
      downloadExport(data);
      setStatus({ kind: 'info', text: 'Backup file downloaded.' });
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

  return (
    <div className="app-layout">
      <main className="canvas-area backup-area">
        <div className="backup-card">
          <h1>Export &amp; Import</h1>
          <p className="backup-intro">
            Back up all waypoints and survey data stored in this browser to a single file, or restore a
            previously exported file — useful for moving your data to another device.
          </p>

          <section className="backup-section">
            <h2>Currently stored</h2>
            {summary ? (
              <ul className="backup-summary">
                <li>Current plan: {summary.hasCurrentPlan ? 'present' : 'none'}</li>
                <li>Confirmed plan history: {summary.planHistoryCount} record(s)</li>
                <li>Survey history: {summary.surveyHistoryCount} record(s)</li>
              </ul>
            ) : (
              <p className="empty-state">Loading…</p>
            )}
          </section>

          <section className="backup-section">
            <h2>Export</h2>
            <p className="backup-help">Downloads one JSON file containing everything above.</p>
            <div className="toolbar-actions">
              <button type="button" className="btn-primary" onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exporting…' : 'Export All Data'}
              </button>
            </div>
          </section>

          <section className="backup-section">
            <h2>Import</h2>
            <p className="backup-help">
              Choose a previously exported RHAMS backup file. This replaces all data currently stored in this
              browser.
            </p>
            <div className="toolbar-actions">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {isImporting ? 'Importing…' : 'Choose Backup File…'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </section>

          {status && <p className={`backup-status backup-status-${status.kind}`}>{status.text}</p>}
        </div>
      </main>
    </div>
  );
}
