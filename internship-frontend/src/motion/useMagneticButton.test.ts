import { describe, it, expect } from "vitest";
import { computeMagneticOffset } from "./useMagneticButton";

describe("computeMagneticOffset", () => {
  it("returns zero offset when the cursor is outside the radius", () => {
    expect(computeMagneticOffset(200, 200, 0, 0, 50, 0.5)).toEqual({ x: 0, y: 0 });
  });

  it("returns zero offset when the cursor is exactly at the origin", () => {
    const result = computeMagneticOffset(0, 0, 0, 0, 100, 0.5);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
  });

  it("pulls more strongly the closer the cursor is to the origin", () => {
    const nearCenter = computeMagneticOffset(10, 0, 0, 0, 100, 0.5);
    const nearEdge = computeMagneticOffset(90, 0, 0, 0, 100, 0.5);
    // normalized pull-per-distance is higher near the center than near the edge
    expect(Math.abs(nearCenter.x) / 10).toBeGreaterThan(Math.abs(nearEdge.x) / 90);
  });

  it("returns zero offset when radius is zero or negative", () => {
    expect(computeMagneticOffset(5, 5, 0, 0, 0, 0.5)).toEqual({ x: 0, y: 0 });
    expect(computeMagneticOffset(5, 5, 0, 0, -10, 0.5)).toEqual({ x: 0, y: 0 });
  });
});
