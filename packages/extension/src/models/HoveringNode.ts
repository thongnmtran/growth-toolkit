import { Rect, Shape } from '@mirohq/websdk-types';
import { ModuleInfo } from './ModuleInfo';

export type HoveringNode = {
  node?: Shape;
  info?: ModuleInfo;
  rect?: Rect;
};
