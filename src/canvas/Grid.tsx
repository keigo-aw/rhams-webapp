export function Grid() {
  const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i <= 8; i++) {
    const p = i * 100;
    lines.push({ key: `v${i}`, x1: p, y1: 0, x2: p, y2: 800 });
    lines.push({ key: `h${i}`, x1: 0, y1: p, x2: 800, y2: p });
  }
  return (
    <g>
      {lines.map((l) => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="grid-line" />
      ))}
    </g>
  );
}
