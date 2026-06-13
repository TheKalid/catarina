/** A single time-series point: epoch-ms timestamp `t`, numeric value `v`. */
export interface Point {
  t: number;
  v: number;
}

/**
 * Largest-Triangle-Three-Buckets downsampling. Reduces a dense series to
 * `threshold` points while preserving visual shape (peaks/troughs) far better
 * than naive sampling. Returns the input unchanged when it's already small.
 *
 * Our ranges (24h/7d) fit under the API's 1000-row cap, but this keeps wider
 * ranges smooth and cheap to render.
 */
export function lttb(points: Point[], threshold: number): Point[] {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points;

  const sampled: Point[] = [points[0]]; // always keep the first point
  const bucketSize = (n - 2) / (threshold - 2);
  let a = 0; // index of the previously selected point

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);

    // Average point of the next bucket (the third triangle vertex).
    let avgT = 0;
    let avgV = 0;
    const avgCount = rangeEnd - rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      avgT += points[j].t;
      avgV += points[j].v;
    }
    avgT /= avgCount || 1;
    avgV /= avgCount || 1;

    // Pick the point in this bucket forming the largest triangle with `a` and avg.
    const bucketStart = Math.floor(i * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    let maxArea = -1;
    let chosen = bucketStart;
    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (points[a].t - avgT) * (points[j].v - points[a].v) -
          (points[a].t - points[j].t) * (avgV - points[a].v),
      );
      if (area > maxArea) {
        maxArea = area;
        chosen = j;
      }
    }
    sampled.push(points[chosen]);
    a = chosen;
  }

  sampled.push(points[n - 1]); // always keep the last point
  return sampled;
}
