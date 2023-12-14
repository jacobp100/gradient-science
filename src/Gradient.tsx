import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import ColorScale from "./ColorScale";
import { TileBatcher } from "./TileBatcher";

import "./Gradient.css";

type Props = {
  width: number;
  height: number;
  colorScale: ColorScale;
  angle: number | undefined;
  className?: string;
};

type CtxState = {
  width: number;
  height: number;
  colorSpace: string;
  ctx: CanvasRenderingContext2D;
};

export const Gradient = ({
  width,
  height,
  colorScale,
  angle = 0,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxStateRef = useRef<CtxState | null>(null);
  const [tileBatcher] = useState(() => new TileBatcher());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      ctxStateRef.current = null;
      return;
    }

    const colorSpace = colorScale.colorProfile === "p3" ? "display-p3" : "srgb";

    const ctxState = ctxStateRef.current;
    let ctx: CanvasRenderingContext2D;
    if (
      ctxState != null &&
      ctxState.width === width &&
      ctxState.height === height &&
      ctxState.colorSpace === colorSpace
    ) {
      ctx = ctxState.ctx;
    } else {
      ctx = canvas.getContext("2d", { colorSpace })!;
      if (ctx == null) return;

      ctxStateRef.current = { width, height, colorSpace, ctx };
    }

    const cosA = Math.cos(angle - Math.PI / 2);
    const sinA = Math.sin(angle - Math.PI / 2);
    const pixelWidth = canvas.width;
    const pixelHeight = canvas.height;
    const length =
      2 *
      Math.hypot(pixelWidth / 2, pixelHeight / 2) *
      Math.max(
        Math.abs(
          Math.sin(Math.PI / 2 - angle + Math.atan(pixelWidth / pixelHeight))
        ),
        Math.abs(
          Math.cos(Math.PI / 2 - angle + Math.atan(pixelHeight / pixelWidth))
        )
      );

    tileBatcher.redraw(
      pixelWidth,
      pixelHeight,
      (x0: number, y0: number, w: number, h: number) => {
        const imageData = ctx.createImageData(w, h, { colorSpace });
        const { data } = imageData;

        const color = { r: NaN, g: NaN, b: NaN, a: NaN };
        for (let x = 0; x < w; x += 1) {
          for (let y = 0; y < h; y += 1) {
            let l =
              (x0 + x - pixelWidth / 2) * cosA +
              (y0 + y - pixelHeight / 2) * sinA;
            l = l / length + 0.5;

            const index = (((((w * y) | 0) + x) | 0) * 4) | 0;

            colorScale.writeInto(l, color);
            data[index + 0] = (color.r * 255) | 0;
            data[index + 1] = (color.g * 255) | 0;
            data[index + 2] = (color.b * 255) | 0;
            data[index + 3] = (color.a * 255) | 0;
          }
        }

        ctx.putImageData(imageData, x0, y0);
      }
    );
  }, [tileBatcher, width, height, colorScale, angle]);

  return (
    <canvas
      ref={canvasRef}
      className={classNames("Gradient", className)}
      width={width * devicePixelRatio}
      height={height * devicePixelRatio}
      style={{ width, height }}
    />
  );
};
