import { describe, it, expect } from "vitest";
import {
  normalizePoints,
  areaPathD,
  linePathD,
  ringSegments,
  funnelWidths,
  clampPercent,
} from "./chartMath";

describe("normalizePoints", () => {
  it("returns an empty array for no values", () => {
    expect(normalizePoints([], 100, 50)).toEqual([]);
  });

  it("returns a centered point for a single value", () => {
    expect(normalizePoints([42], 100, 50)).toEqual([{ x: 50, y: 25 }]);
  });

  it("places a higher value at a smaller y (higher on screen)", () => {
    const points = normalizePoints([1, 5], 100, 50, 0);
    expect(points[1].y).toBeLessThan(points[0].y);
  });

  it("collapses a flat series to the vertical midline instead of dividing by zero", () => {
    const points = normalizePoints([7, 7, 7], 90, 60);
    expect(points.every((p) => p.y === 30)).toBe(true);
  });

  it("spans the full width from the first to the last point", () => {
    const points = normalizePoints([1, 2, 3, 4], 120, 50);
    expect(points[0].x).toBe(0);
    expect(points[points.length - 1].x).toBe(120);
  });
});

describe("areaPathD", () => {
  it("returns an empty string for fewer than 2 points", () => {
    expect(areaPathD([], 50)).toBe("");
    expect(areaPathD([{ x: 0, y: 0 }], 50)).toBe("");
  });

  it("builds a closed path that drops to the baseline height on both ends", () => {
    const d = areaPathD(
      [
        { x: 0, y: 10 },
        { x: 20, y: 5 },
      ],
      50
    );
    expect(d).toBe("M 0 50 L 0 10 L 20 5 L 20 50 Z");
  });
});

describe("linePathD", () => {
  it("returns an empty string for fewer than 2 points", () => {
    expect(linePathD([{ x: 0, y: 0 }])).toBe("");
  });

  it("builds an open polyline through every point", () => {
    const d = linePathD([
      { x: 0, y: 10 },
      { x: 20, y: 5 },
      { x: 40, y: 8 },
    ]);
    expect(d).toBe("M 0 10 L 20 5 L 40 8");
  });
});

describe("ringSegments", () => {
  it("returns no segments when every value is zero", () => {
    expect(ringSegments([0, 0], 100)).toEqual([]);
  });

  it("gives a single value the full circumference with no offset", () => {
    expect(ringSegments([5], 100)).toEqual([{ dashArray: "100 0", dashOffset: 0 }]);
  });

  it("splits two equal values into two half-circumference dashes, offset around the ring", () => {
    expect(ringSegments([1, 1], 100)).toEqual([
      { dashArray: "50 50", dashOffset: 0 },
      { dashArray: "50 50", dashOffset: -50 },
    ]);
  });
});

describe("funnelWidths", () => {
  it("returns an empty array for no stages", () => {
    expect(funnelWidths([])).toEqual([]);
  });

  it("returns all zeros when the first stage is zero", () => {
    expect(funnelWidths([0, 3, 1])).toEqual([0, 0, 0]);
  });

  it("expresses later stages as a percent of the first stage", () => {
    expect(funnelWidths([100, 40, 10])).toEqual([100, 40, 10]);
  });

  it("clamps a later stage that exceeds the first stage down to 100", () => {
    expect(funnelWidths([10, 20])).toEqual([100, 100]);
  });
});

describe("clampPercent", () => {
  it("returns 0 when total is zero or negative", () => {
    expect(clampPercent(5, 0)).toBe(0);
    expect(clampPercent(5, -10)).toBe(0);
  });

  it("computes the percent of total", () => {
    expect(clampPercent(1, 4)).toBe(25);
  });

  it("clamps above 100 down to 100", () => {
    expect(clampPercent(20, 10)).toBe(100);
  });
});
