import { BoardNode, Frame, Rect, Shape } from '@mirohq/websdk-types';

export function fromScreenToBoard(params: {
  x: number;
  y: number;
  canvas: HTMLCanvasElement;
  viewport: Rect;
}) {
  const { x, y, canvas, viewport } = params;

  const { width: canvasWidth, height: canvasHeight } =
    canvas.getBoundingClientRect();
  const boardX = (x / canvasWidth) * viewport.width + viewport.x;
  const boardY = (y / canvasHeight) * viewport.height + viewport.y;

  return { x: boardX, y: boardY };
}

export function fromItemToCanvas(params: {
  rect: Rect;
  frame: Frame;
  canvas: HTMLCanvasElement;
  viewport: Rect;
}) {
  const screenRect = fromItemToScreen(params);
  const { width, height } = params.canvas;
  const { width: realWidth, height: realHeight } =
    params.canvas.getBoundingClientRect();
  const xRatio = width / realWidth;
  const yRatio = height / realHeight;
  return {
    x: screenRect.x * xRatio,
    y: screenRect.y * yRatio,
    width: screenRect.width * xRatio,
    height: screenRect.height * yRatio,
  };
}

export function fromItemToScreen(params: {
  rect: Rect;
  frame: Frame;
  canvas: HTMLCanvasElement;
  viewport: Rect;
}) {
  const { rect, frame, canvas, viewport } = params;

  const boardX = rect.x - frame.width / 2 + frame.x - rect.width / 2;
  const boardY = rect.y - frame.height / 2 + frame.y - rect.height / 2;

  const { width: canvasWidth, height: canvasHeight } =
    canvas.getBoundingClientRect();
  const x = ((boardX - viewport.x) / viewport.width) * canvasWidth;
  const y = ((boardY - viewport.y) / viewport.height) * canvasHeight;
  const width = (rect.width / viewport.width) * canvasWidth;
  const height = (rect.height / viewport.height) * canvasHeight;

  return { x, y, width, height };
}

export function findHoveringItem(params: {
  x: number;
  y: number;
  frames: Frame[];
  nodes: BoardNode[];
  canvas: HTMLCanvasElement;
  viewport: Rect;
}): { node: Shape; rect: Rect } | null {
  const { canvas, frames, nodes, viewport, x, y } = params;

  const { x: cursorX, y: cursorY } = fromScreenToBoard({
    x,
    y,
    canvas,
    viewport,
  });

  for (const frame of frames) {
    const frameNodes = (nodes as Shape[]).filter(
      (node) => node.parentId === frame.id,
    );

    const curNode = frameNodes.find((node) => {
      const nodeX = node.x - frame.width / 2 + frame.x - node.width / 2;
      const nodeY = node.y - frame.height / 2 + frame.y - node.height / 2;
      return (
        nodeX <= cursorX &&
        cursorX <= nodeX + node.width &&
        nodeY <= cursorY &&
        cursorY <= nodeY + node.height
      );
    });

    if (curNode) {
      const rect = fromItemToScreen({ canvas, frame, rect: curNode, viewport });
      return { rect, node: curNode };
    }
  }

  return null;
}
