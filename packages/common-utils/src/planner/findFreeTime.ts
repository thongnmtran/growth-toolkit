type TimeRecord = [number, number];
type Timeline = Array<TimeRecord>; // [[time, num]]

function toTimeline(times: number[]): Timeline {
  const timeMap: Timeline = [];
  let prevTime = 0;
  times.forEach((timeI) => {
    if (timeI === prevTime) {
      const prevRecord = timeMap[timeMap.length - 1];
      if (prevRecord) {
        prevRecord[1]++;
      }
    } else {
      timeMap.push([timeI, 1]);
    }
    prevTime = timeI;
  });
  return timeMap;
}

function getEndTime(timeI: TimeRecord, amountPerAction: number) {
  return timeI[0] + timeI[1] * amountPerAction;
}

/**
 * Giải thuật tìm thời gian sớm nhất có thể để thực hiện hành động
 * - Yêu cầu:
 *   + không làm break những action đã định sẵn thời gian trong tương lai
 *   + Không vượt quá rate khi gộp với những action trong quá khứ
 * - Chạy từ đầu đến khi tìm được 1 khoảng trống đủ cho "amount"
 */
export function findFreeTime(
  times: number[],
  window: number,
  maxNumActions: number,
  numActions: number
) {
  const timeline = toTimeline(times);
  const now = Date.now();

  // Nếu nằm ngoài khoảng window thì k cần kiểm tra nữa vì có thể gửi ngay
  const latestTime = timeline.at(-1);
  if (!latestTime || now - latestTime[0] > window) {
    return now;
  }

  const amountPerAction = window / maxNumActions;
  const amount = amountPerAction * numActions; // Thời gian cần thiết để thực hiện n request

  let freetime = 0;
  timeline.some((timeI, index) => {
    const next = timeline[index + 1];
    if (!next) {
      freetime = getEndTime(timeI, amountPerAction) + 1;
      return freetime >= now;
    }
    const space = next[0] - getEndTime(timeI, amountPerAction);
    const found = space >= amount;
    if (found) {
      freetime = getEndTime(timeI, amountPerAction) + 1;
      return freetime >= now;
    }
    return false;
  });

  return Math.max(freetime, Date.now());
}
