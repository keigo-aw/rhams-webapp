/** Rasterizes a self-contained SVG element (literal colors, no external CSS) and copies it to the clipboard as PNG. */
export async function copySvgAsPng(svg: SVGSVGElement, backgroundColor: string): Promise<void> {
  const width = svg.viewBox.baseVal.width || svg.clientWidth;
  const height = svg.viewBox.baseVal.height || svg.clientHeight;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const scale = 2; // sharper copy
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.scale(scale, scale);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to encode PNG');

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load chart image'));
    img.src = src;
  });
}
