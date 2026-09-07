import { useRef, useState } from 'react';
import { BarChart, type BarChartPoint } from '../viz/BarChart';
import { Kicker } from '../ui/Kicker';
import { Table, TableUnit } from '../ui/Table';
import { Tag } from '../ui/Tag';
import { AnalysisSidePanel } from './AnalysisSidePanel';
import { PanelPortal } from '../shell/PanelSlot';
import { useAnalysis } from './useAnalysis';
import { buildSurveyCsv, downloadCsv } from './exportCsv';
import { copySvgAsPng } from './exportPng';
import { resolveCssVar } from '../utils/theme';

export function AnalysisScreen() {
  const {
    records,
    isLoading,
    selectedRecord,
    selectRecord,
    thresholdInUnit,
    setThresholdInUnit,
    hazardCategory,
    setHazardCategory,
    standardId,
    setStandard,
    rows,
    vPerMToWPerM2,
  } = useAnalysis();
  const chartWrapRef = useRef<HTMLElement | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleExportCsv = () => {
    if (!selectedRecord) return;
    const csv = buildSurveyCsv(rows);
    const dateStamp = new Date(selectedRecord.completedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCsv(`survey-${dateStamp}.csv`, csv);
  };

  const handleCopyPng = async () => {
    const svg = chartWrapRef.current?.querySelector('svg');
    if (!svg) return;
    try {
      await copySvgAsPng(svg, resolveCssVar('--color-surface', '#e9e9ea'));
      setCopyStatus('Chart copied to clipboard.');
    } catch {
      setCopyStatus('Could not copy chart — your browser may not support clipboard images.');
    }
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const chartPoints: BarChartPoint[] = rows.map(({ waypoint, reading, pass }) => ({
    id: waypoint.id,
    n: waypoint.order + 1,
    valueVPerM: reading.fieldStrengthVPerM,
    over: !pass,
  }));

  return (
    <>
      <div style={{ width: 660, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {isLoading ? (
          <p>Loading…</p>
        ) : !selectedRecord ? (
          <p style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
            {records.length === 0
              ? 'No completed surveys yet. Run a Signal Survey to record data to analyze.'
              : 'Select a survey record to analyze it.'}
          </p>
        ) : (
          <>
            <figure className="blueprint" style={{ background: 'var(--color-surface)', padding: '16px 18px', margin: 0 }} ref={chartWrapRef}>
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <Kicker style={{ margin: '0 0 10px' }}>Field strength by measurement point — V/m</Kicker>
              <BarChart points={chartPoints} limitVPerM={thresholdInUnit} />
            </figure>

            <div>
              <Kicker style={{ margin: '0 0 8px' }}>Readings</Kicker>
              <Table>
                <thead>
                  <tr>
                    <th>Point</th>
                    <th>Result</th>
                    <th>
                      X<TableUnit>m</TableUnit>
                    </th>
                    <th>
                      Y<TableUnit>m</TableUnit>
                    </th>
                    <th>
                      E-field<TableUnit>V/m</TableUnit>
                    </th>
                    <th>
                      Power<TableUnit>W/m²</TableUnit>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ waypoint, reading, pass }) => (
                    <tr key={waypoint.id}>
                      <td className="num">{waypoint.order + 1}</td>
                      <td>
                        {pass ? <Tag variant="accent">Pass</Tag> : <Tag variant="danger">Exceed</Tag>}
                      </td>
                      <td className="num">{waypoint.x.toFixed(1)}</td>
                      <td className="num">{waypoint.y.toFixed(1)}</td>
                      <td className="num">{reading.fieldStrengthVPerM.toFixed(2)}</td>
                      <td className="num">{vPerMToWPerM2(reading.fieldStrengthVPerM).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>

      <PanelPortal>
        <AnalysisSidePanel
          records={records}
          selectedId={selectedRecord?.id ?? null}
          onSelectRecord={selectRecord}
          hazardCategory={hazardCategory}
          onHazardCategoryChange={setHazardCategory}
          standardId={standardId}
          onStandardChange={setStandard}
          thresholdInUnit={thresholdInUnit}
          onThresholdChange={setThresholdInUnit}
          onExportCsv={handleExportCsv}
          onCopyPng={handleCopyPng}
          copyStatus={copyStatus}
          disabled={!selectedRecord}
        />
      </PanelPortal>
    </>
  );
}
