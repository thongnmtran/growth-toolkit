import { myMiro } from '@/helpers/MyMiro';

export function cloneCanvas() {
  const clone = myMiro.canvas.cloneNode() as HTMLCanvasElement;
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  // clone.style.opacity = '0.5';
  clone.style.background = 'transparent';
  return clone;
}
