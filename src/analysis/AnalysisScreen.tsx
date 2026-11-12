import { useRef, useState } from 'react';
import { AnalysisSidePanel } from './AnalysisSidePanel';
import { ReadingsChart } from './ReadingsChart';
import { ReadingsTable } from './ReadingsTable';
import { useAnalysis } from './useAnalysis';
import { buildSurveyXlsx, downloadXlsx } from './exportXlsx';
import { copySvgAsPng } from './exportPng';
import { resolveCssVar } from '../utils/theme';
import { probeTypeRangeLabel } from '../survey/surveyConfig';

export function AnalysisScreen() {
  const {
    records,
    isLoading,
    selectedRecord,
    selectRecord,
    unit,
    setUnit,
    limitLines,
    activeThresholdInUnit,
    frequencyMHz,
    setFrequencyMHz,
    frequencyIsDefault,
    pmaxW,
    setPmaxW,
    selectedStandardIds,
    toggleStandard,
    addCustomLine,
    removeCustomLine,
    renameCustomLine,
    setCustomLineInUnit,
    rows,
    chartData,
  } = useAnalysis();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleExportExcel = () => {
    if (!selectedRecord) return;
    const bytes = buildSurveyXlsx(rows, { completedAt: selectedRecord.completedAt, frequencyMHz, pmaxW });
    const dateStamp = new Date(selectedRecord.completedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadXlsx(`survey-${dateStamp}.xlsx`, bytes);
  };

  const handleCopyPng = async () => {
    if (!svgRef.current) return;
    try {
      await copySvgAsPng(svgRef.current, resolveCssVar('--surface-low', '#151c28'));
      setCopyStatus('Chart copied to clipboard.');
    } catch {
      setCopyStatus('Could not copy chart — your browser may not support clipboard images.');
    }
    setTimeout(() => setCopyStatus(null), 3000);
  };

  return (
    <div className="app-layout">
      <main className="canvas-area analysis-area">
        {isLoading ? (
          <p className="empty-state">Loading…</p>
        ) : selectedRecord ? (
          <div className="analysis-content">
            <div className="history-stats">
              <span>{new Date(selectedRecord.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span>{selectedRecord.waypoints.length} waypoints</span>
              <span>
                Height <strong>{selectedRecord.height} m</strong>
              </span>
              <span>
                Probe <strong>{selectedRecord.probeType}</strong> ({probeTypeRangeLabel(selectedRecord.probeType)})
              </span>
              <span>
                Limits @ <strong>{frequencyMHz} MHz</strong>
              </span>
            </div>
            <div className="chart-scroll">
              <ReadingsChart
                data={chartData}
                unit={unit}
                limits={limitLines}
                activeThresholdInUnit={activeThresholdInUnit}
                svgRef={svgRef}
                onCustomLimitChange={setCustomLineInUnit}
              />
            </div>
            <ReadingsTable rows={rows} />
          </div>
        ) : (
          <p className="empty-state">
            {records.length === 0
              ? 'No past surveys recorded yet. Confirm a path and run a Signal Survey to record one.'
              : 'Select a survey from the list to analyze it.'}
          </p>
        )}
      </main>
      <AnalysisSidePanel
        records={records}
        selectedId={selectedRecord?.id ?? null}
        onSelectRecord={selectRecord}
        unit={unit}
        onUnitChange={setUnit}
        limitLines={limitLines}
        frequencyMHz={frequencyMHz}
        onFrequencyChange={setFrequencyMHz}
        frequencyIsDefault={frequencyIsDefault}
        pmaxW={pmaxW}
        onPmaxChange={setPmaxW}
        selectedStandardIds={selectedStandardIds}
        onToggleStandard={toggleStandard}
        onAddCustomLine={addCustomLine}
        onRemoveCustomLine={removeCustomLine}
        onRenameCustomLine={renameCustomLine}
        onCustomLineChange={setCustomLineInUnit}
        onExportCsv={handleExportExcel}
        onCopyPng={handleCopyPng}
        copyStatus={copyStatus}
        disabled={!selectedRecord}
      />
    </div>
  );
}
