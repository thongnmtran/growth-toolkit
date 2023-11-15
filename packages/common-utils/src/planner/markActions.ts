export function markActions(times: number[], time: number, numActions = 1) {
  times.push(...new Array(numActions).fill(time));
  times.sort();
  return times;
}
