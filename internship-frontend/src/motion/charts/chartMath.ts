export interface Point {
  x: number;
  y: number;
}

export interface RingSegment {
  dashArray: string;
  dashOffset: number;
}

/**
 * Maps a series of values onto SVG coordinates spanning `width`x`height`,
 * inverted so a larger value sits higher up (smaller y). A flat series (or a
 * single point) collapses to the vertical midline instead of dividing by
 * zero.
 */
export function normalizePoints(
  values: number[],
  width: number,
  height: number,
  padding = 8
): Point[] {
  if (values.length === 0) return [];
  if (values.length === 1) {
    return [{ x: width / 2, y: height / 2 }];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const stepX = width / (values.length - 1);

  return values.map((v, i) => {
    const y =
      range === 0
        ? height / 2
        : padding + (1 - (v - min) / range) * (height - padding * 2);
    return { x: i * stepX, y };
  });
}

/** Builds a closed SVG path filling the area under a line, from the first
 * point down to `height`, across, and back up to the last point. Returns ''
 * for fewer than 2 points — an area chart needs at least a line segment. */
export function areaPathD(points: Point[], height: number): string {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  const last = points[points.length - 1];
  const line = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
  return `M ${first.x} ${height} L ${first.x} ${first.y} ${line} L ${last.x} ${height} Z`;
}

/** Builds an open SVG polyline through every point. Returns '' for fewer
 * than 2 points. */
export function linePathD(points: Point[]): string {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  const line = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
  return `M ${first.x} ${first.y} ${line}`;
}

/**
 * Splits `circumference` proportionally across `values` as
 * stroke-dasharray/stroke-dashoffset pairs for stacking arcs around one
 * <circle>, starting at 12 o'clock and proceeding clockwise. Returns []
 * when every value is zero (the caller should render an empty-state ring
 * instead of an arc with no length).
 */
export function ringSegments(values: number[], circumference: number): RingSegment[] {
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total <= 0) return [];

  let cumulative = 0;
  return values.map((v) => {
    const dashLen = (v / total) * circumference;
    const dashOffset = cumulative === 0 ? 0 : -cumulative;
    cumulative += dashLen;
    return { dashArray: `${dashLen} ${circumference - dashLen}`, dashOffset };
  });
}

/**
 * Percent width of each stage relative to the first stage (100 = same size
 * as stage 0). A zero-valued first stage returns all zeros rather than
 * dividing by zero — the funnel should render as empty, not NaN-wide bars.
 */
export function funnelWidths(values: number[]): number[] {
  if (values.length === 0) return [];
  const base = values[0];
  if (base <= 0) return values.map(() => 0);
  return values.map((v) => Math.max(0, Math.min(100, (v / base) * 100)));
}

/**
 * `value` as a percent of `total`, clamped to [0, 100]. A zero or negative
 * total returns 0 instead of NaN or Infinity.
 */
export function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}
