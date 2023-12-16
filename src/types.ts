import type Color from "colorjs.io";

export type ColorProfile = "p3" | "srgb";

export enum PreviewBackground {
  Black = "black",
  White = "white",
  CheckerLight = "var(--checker-light)",
  CheckerDark = "var(--checker-dark)",
}

export enum Mode {
  Gradient = "gradient",
  Stops = "stops",
}

export type ControlPoints = {
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
};

export type ColorStop = {
  id: string;
  color: Color;
  position: number;
  midpoint: number;
};

export type OpacityStop = {
  id: string;
  alpha: number;
  position: number;
  midpoint: number;
};
