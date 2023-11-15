import { findFreeTime } from './findFreeTime';
import { markActions } from './markActions';

export class Planner {
  constructor(
    public window: number,
    public numActionsPerWindow: number,
    public times?: number[]
  ) {}

  findFreeTime(numActions: number) {
    return findFreeTime(
      this.times || [],
      this.window,
      this.numActionsPerWindow,
      numActions
    );
  }

  markActions(time: number, numActions = 1) {
    return markActions(this.times || [], time, numActions);
  }
}
