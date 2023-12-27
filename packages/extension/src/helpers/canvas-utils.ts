const _canvas = document.createElement('canvas');

export function getTextWidth(text: string, font?: string): number {
  const context = _canvas.getContext('2d');
  if (context) {
    if (font) {
      context.font = font;
    }
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return 0;
}

export function lineWidth(level = 10) {
  const borderWidths = [1, 2, 3, 4, 5, 8, 12, 16, 20, 24];
  return borderWidths[level - 1] || 1;
}

export function gridSize(level = 10) {
  const gridSizes = [24, 24, 24, 48, 48, 96, 96, 192, 192, 384];
  return gridSizes[level - 1] || 24;
}

export type HeatmapPoint = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number; // 0% -> 100% of max
};

export function drawHeatmap(params: {
  canvas: HTMLCanvasElement;
  points: HeatmapPoint[];
}) {
  const { canvas, points } = params;
  const ctx = canvas.getContext('2d')!;
  points.forEach((point) => {
    drawHeatmapPoint(ctx, point);
  });
}

export function drawHeatmapPoint(
  ctx: CanvasRenderingContext2D,
  point: HeatmapPoint,
) {
  const { x, y, width, height, value } = point;
  const weight = value * 2;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const innerRadius = 0;
  const outerRadius = (width / 2) * weight;
  const scaleX = 1;
  const scaleY = height / width;

  ctx.setTransform(scaleX, 0, 0, scaleY, cx, cy);

  const gradient = ctx.createRadialGradient(
    0,
    0,
    innerRadius,
    0,
    0,
    outerRadius,
  );

  gradient.addColorStop(0, `rgba(255, 0, 0, ${value})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.arc(0, 0, width * weight, 0, 2 * Math.PI);
  // console.log('> Draw', x, y, width, height, value);

  ctx.fillStyle = gradient;
  ctx.fill();
}
