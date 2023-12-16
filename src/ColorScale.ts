import UnitBezier from "@mapbox/unitbezier";
import Color from "colorjs.io";
import { lastIndex } from "./orderedArray";
import type {
  ColorProfile,
  ColorStop,
  ControlPoints,
  OpacityStop,
} from "./types";

const bins = 1024;

const interpolateMidpoint = (d: number, m: number, p0: number, p1: number) => {
  if (d <= p0) {
    return 0;
  } else if (d >= p1) {
    return 1;
  }

  const pm = p0 + m * (p1 - p0);
  if (d <= pm) {
    const d0 = (pm - d) / (pm - p0);
    return 0.5 - 0.5 * d0;
  } else {
    const d1 = (d - pm) / (p1 - pm);
    return 0.5 + 0.5 * d1;
  }
};

export const mixOklch = (d: number, a: Color, b: Color) => {
  if (d <= 0) {
    return a;
  } else if (d >= 1) {
    return b;
  }

  const { 0: l0, 1: c0, 2: h0 } = a.coords;
  const { 0: l1, 1: c1, 2: h1 } = b.coords;

  let h: number;
  if (c0 === 0 && c1 === 0) {
    h = 0;
  } else if (c0 === 0) {
    h = h1;
  } else if (c1 === 0) {
    h = h0;
  } else {
    const xH = h0;
    let yH = h1;
    const deltaH = h1 - h0;
    if (deltaH > 180) {
      yH -= 360;
    } else if (deltaH < -180) {
      yH += 360;
    }
    h = xH * (1 - d) + yH * d;
  }

  const c = c0 * (1 - d) + c1 * d;
  const l = l0 * (1 - d) + l1 * d;

  return new Color({ spaceId: "oklch", coords: [l, c, h], alpha: 1 });
};

export default class ColorScale {
  private readonly colorStops: ColorStop[];
  private readonly opacityStops: OpacityStop[];
  private readonly unitBezier: UnitBezier | null;
  private readonly cache = new Float64Array(((bins + 1) * 4) | 0).fill(NaN);

  constructor(
    public readonly colorProfile: ColorProfile,
    colorStops: ColorStop[],
    opacityStops: OpacityStop[],
    controlPoints: ControlPoints | undefined
  ) {
    this.colorStops = colorStops
      .map((colorStop) => ({
        id: colorStop.id,
        color: colorStop.color.to("oklch"),
        position: colorStop.position,
        midpoint: colorStop.midpoint,
      }))
      .sort((a, b) => a.position - b.position);
    this.opacityStops = opacityStops
      .slice()
      .sort((a, b) => a.position - b.position);
    this.unitBezier =
      controlPoints != null
        ? new UnitBezier(
            controlPoints.p1x,
            controlPoints.p1y,
            controlPoints.p2x,
            controlPoints.p2y
          )
        : null;
  }
  writeInto(_d: number, out: { r: number; g: number; b: number; a: number }) {
    const { colorProfile, colorStops, opacityStops, unitBezier, cache } = this;

    let d = _d;
    if (unitBezier != null) {
      d = unitBezier.solve(d);
    }
    d = Math.min(Math.max(d, 0), 1);
    d = Math.trunc(d * bins) / bins;

    const bin = (((bins * d) | 0) * 4) | 0;

    if (!Number.isNaN(cache[bin])) {
      out.r = cache[bin + 0];
      out.g = cache[bin + 1];
      out.b = cache[bin + 2];
      out.a = cache[bin + 3];
      return;
    }

    let color: Color | undefined;
    if (colorStops.length === 0) {
      color = undefined;
    } else if (colorStops.length === 1) {
      color = colorStops[0].color;
    } else if (d < colorStops[0].position) {
      color = colorStops[0].color;
    } else if (d > colorStops[colorStops.length - 1].position) {
      color = colorStops[colorStops.length - 1].color;
    } else {
      const index = Math.min(
        lastIndex(colorStops, (c) => c.position <= d) ?? 0,
        colorStops.length - 2
      );
      const left = colorStops[index];
      const right = colorStops[index + 1];
      const distance = interpolateMidpoint(
        d,
        left.midpoint,
        left.position,
        right.position
      );

      color = mixOklch(distance, left.color, right.color);
    }
    const coords = color == null ? [0, 0, 0] : color.to(colorProfile).coords;

    let alpha: number;
    if (opacityStops.length === 0) {
      alpha = 1;
    } else if (opacityStops.length === 1) {
      alpha = opacityStops[0].alpha;
    } else if (d < opacityStops[0].position) {
      alpha = opacityStops[0].alpha;
    } else if (d > opacityStops[opacityStops.length - 1].position) {
      alpha = opacityStops[opacityStops.length - 1].alpha;
    } else {
      const index = Math.min(
        lastIndex(opacityStops, (c) => c.position <= d) ?? 0,
        opacityStops.length - 2
      );
      const left = opacityStops[index];
      const right = opacityStops[index + 1];
      const distance = interpolateMidpoint(
        d,
        left.midpoint,
        left.position,
        right.position
      );

      alpha = left.alpha + (right.alpha - left.alpha) * distance;
    }

    out.r = cache[bin + 0] = Math.min(Math.max(coords[0], 0), 1);
    out.g = cache[bin + 1] = Math.min(Math.max(coords[1], 0), 1);
    out.b = cache[bin + 2] = Math.min(Math.max(coords[2], 0), 1);
    out.a = cache[bin + 3] = alpha;

    return;
  }

  at(d: number) {
    const out = { r: NaN, g: NaN, b: NaN, a: NaN };
    this.writeInto(d, out);
    return new Color({
      spaceId: this.colorProfile,
      coords: [out.r, out.g, out.b],
      alpha: out.a,
    });
  }
}
