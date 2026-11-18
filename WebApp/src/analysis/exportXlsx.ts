import type { SignalReading, Waypoint } from '../types/domain';
import { vPerMToWPerM2 } from '../utils/units';

interface XlsxRow {
  waypoint: Waypoint;
  reading: SignalReading;
}

interface SurveyMeta {
  completedAt: number;
  frequencyMHz: number;
  pmaxW: number;
}

// ── zip (stored, no compression) ──────────────────────────────────────────────

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (~crc) >>> 0;
}

function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const data = file.data;
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const ldv = new DataView(local.buffer);
    ldv.setUint32(0, 0x04034b50, true);
    ldv.setUint16(4, 20, true); // version needed
    ldv.setUint32(14, crc, true);
    ldv.setUint32(18, data.length, true); // compressed size
    ldv.setUint32(22, data.length, true); // uncompressed size
    ldv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    chunks.push(local, data);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cd.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true); // version made by
    cdv.setUint16(6, 20, true); // version needed
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, data.length, true);
    cdv.setUint32(24, data.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint32(42, offset, true); // local header offset
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += local.length + data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const cd of central) {
    chunks.push(cd);
    centralSize += cd.length;
  }

  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(8, files.length, true);
  edv.setUint16(10, files.length, true);
  edv.setUint32(12, centralSize, true);
  edv.setUint32(16, centralStart, true);
  chunks.push(eocd);

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return out;
}

// ── OOXML parts ───────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface SheetRow {
  point: number;
  date: string;
  time: string;
  freqHz: number;
  vPerM: number;
  wPerM2: number;
  pmaxW: number;
}

function sheetXml(rows: SheetRow[]): string {
  const headers = ['Point', 'Date', 'Time', 'Frequencies (Hz)', 'V/m', 'W/m2', 'Pmax (W)'];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const headerCells = headers
    .map((h, i) => `<c r="${cols[i]}1" t="inlineStr"><is><t>${esc(h)}</t></is></c>`)
    .join('');
  const body = rows
    .map((r, i) => {
      const n = i + 2;
      return (
        `<row r="${n}">` +
        `<c r="A${n}"><v>${r.point}</v></c>` +
        `<c r="B${n}" t="inlineStr"><is><t>${esc(r.date)}</t></is></c>` +
        `<c r="C${n}" t="inlineStr"><is><t>${esc(r.time)}</t></is></c>` +
        `<c r="D${n}"><v>${r.freqHz}</v></c>` +
        `<c r="E${n}"><v>${r.vPerM}</v></c>` +
        `<c r="F${n}"><v>${r.wPerM2}</v></c>` +
        `<c r="G${n}"><v>${r.pmaxW}</v></c>` +
        `</row>`
      );
    })
    .join('');
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<cols><col min="1" max="7" width="18" customWidth="1"/></cols>` +
    `<sheetData><row r="1">${headerCells}</row>${body}</sheetData>` +
    `<drawing r:id="rId1"/>` +
    `</worksheet>`
  );
}

function chartXml(rows: SheetRow[]): string {
  const last = rows.length + 1; // data ends on this spreadsheet row
  const count = rows.length;
  const catPts = rows.map((r, i) => `<c:pt idx="${i}"><c:v>${r.point}</c:v></c:pt>`).join('');
  const valPts = rows.map((r, i) => `<c:pt idx="${i}"><c:v>${r.vPerM}</c:v></c:pt>`).join('');
  const CAT = '111111111';
  const VAL = '222222222';
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<c:chart>` +
    `<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>Field Strength (V/m) by Point</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>` +
    `<c:autoTitleDeleted val="0"/>` +
    `<c:plotArea><c:layout/>` +
    `<c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>` +
    `<c:ser><c:idx val="0"/><c:order val="0"/>` +
    `<c:tx><c:strRef><c:f>Survey!$E$1</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>V/m</c:v></c:pt></c:strCache></c:strRef></c:tx>` +
    `<c:cat><c:numRef><c:f>Survey!$A$2:$A$${last}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${count}"/>${catPts}</c:numCache></c:numRef></c:cat>` +
    `<c:val><c:numRef><c:f>Survey!$E$2:$E$${last}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${count}"/>${valPts}</c:numCache></c:numRef></c:val>` +
    `</c:ser>` +
    `<c:axId val="${CAT}"/><c:axId val="${VAL}"/>` +
    `</c:barChart>` +
    `<c:catAx><c:axId val="${CAT}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/>` +
    `<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>Point</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>` +
    `<c:crossAx val="${VAL}"/></c:catAx>` +
    `<c:valAx><c:axId val="${VAL}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/>` +
    `<c:title><c:tx><c:rich><a:bodyPr rot="-5400000" vert="horz"/><a:p><a:r><a:t>V/m</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>` +
    `<c:crossAx val="${CAT}"/></c:valAx>` +
    `</c:plotArea>` +
    `<c:plotVisOnly val="1"/>` +
    `</c:chart>` +
    `</c:chartSpace>`
  );
}

const CONTENT_TYPES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
  `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
  `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
  `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` +
  `<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>` +
  `</Types>`;

const ROOT_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
  `</Relationships>`;

const WORKBOOK =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
  `<sheets><sheet name="Survey" sheetId="1" r:id="rId1"/></sheets>` +
  `</workbook>`;

const WORKBOOK_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
  `<fills count="1"><fill><patternFill patternType="none"/></fill></fills>` +
  `<borders count="1"><border/></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>` +
  `</styleSheet>`;

const SHEET_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>` +
  `</Relationships>`;

const DRAWING =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
  `<xdr:twoCellAnchor>` +
  `<xdr:from><xdr:col>7</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>1</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>` +
  `<xdr:to><xdr:col>17</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>22</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>` +
  `<xdr:graphicFrame macro="">` +
  `<xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Chart 1"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>` +
  `<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>` +
  `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">` +
  `<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>` +
  `</a:graphicData></a:graphic>` +
  `</xdr:graphicFrame><xdr:clientData/>` +
  `</xdr:twoCellAnchor></xdr:wsDr>`;

const DRAWING_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>` +
  `</Relationships>`;

/** Builds a .xlsx (data sheet + native column chart of V/m by point) as raw bytes. */
export function buildSurveyXlsx(rows: XlsxRow[], meta: SurveyMeta): Uint8Array {
  const d = new Date(meta.completedAt);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const freqHz = Math.round((meta.frequencyMHz || 0) * 1_000_000);

  const sheetRows: SheetRow[] = rows.map((r) => ({
    point: r.waypoint.order + 1,
    date,
    time,
    freqHz,
    vPerM: Math.round(r.reading.fieldStrengthVPerM * 100) / 100,
    wPerM2: Math.round(vPerMToWPerM2(r.reading.fieldStrengthVPerM) * 1_000_000) / 1_000_000,
    pmaxW: meta.pmaxW,
  }));

  const enc = new TextEncoder();
  const text = (s: string) => enc.encode(s);
  const files = [
    { name: '[Content_Types].xml', data: text(CONTENT_TYPES) },
    { name: '_rels/.rels', data: text(ROOT_RELS) },
    { name: 'xl/workbook.xml', data: text(WORKBOOK) },
    { name: 'xl/_rels/workbook.xml.rels', data: text(WORKBOOK_RELS) },
    { name: 'xl/styles.xml', data: text(STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: text(sheetXml(sheetRows)) },
    { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: text(SHEET_RELS) },
    { name: 'xl/drawings/drawing1.xml', data: text(DRAWING) },
    { name: 'xl/drawings/_rels/drawing1.xml.rels', data: text(DRAWING_RELS) },
    { name: 'xl/charts/chart1.xml', data: text(chartXml(sheetRows)) },
  ];
  return zipStore(files);
}

export function downloadXlsx(filename: string, bytes: Uint8Array): void {
  const blob = new Blob([bytes as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
