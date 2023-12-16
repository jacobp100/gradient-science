import Color from "colorjs.io";
import { useMemo, useState } from "react";
import ColorScale from "./ColorScale";

type Props = {
  colorScale: ColorScale;
  degrees: number;
};

export const useCssExport = ({ colorScale, degrees }: Props) => {
  const [quality, setQuality] = useState(0.95);

  const { colorStopsString, qualityUp, qualityDown } = useMemo(() => {
    const colors = Array.from({ length: 101 }, (_, index) => {
      const p = index / 100;
      const {
        coords: [r, g, b],
        alpha: a,
      } = colorScale.at(p);
      return { r, g, b, a, p };
    });

    const getNextCandidate = (minDistance: number) => {
      let minIndex: number | undefined;
      // NB: Don't remove start and end points
      for (let i = colors.length - 3; i >= 2; i -= 1) {
        const c0 = colors[i - 1];
        const c1 = colors[i + 0];
        const c2 = colors[i + 1];

        const d = (c1.p - c0.p) / (c2.p - c0.p);

        const distance = Math.hypot(
          c0.r * (1 - d) + c2.r * d - c1.r,
          c0.g * (1 - d) + c2.g * d - c1.g,
          c0.b * (1 - d) + c2.b * d - c1.b,
          c0.a * (1 - d) + c2.a * d - c1.a
        );

        if (distance < minDistance) {
          minIndex = i;
          minDistance = distance;
        }
      }

      return minIndex != null
        ? {
            index: minIndex!,
            quality: Math.floor((1 - minDistance) * 100) / 100,
          }
        : undefined;
    };

    let didRemove = false;
    let qualityUp: number | undefined;
    do {
      didRemove = false;

      const candidate = getNextCandidate(1 - quality);

      if (candidate != null) {
        colors.splice(candidate.index, 1);
        didRemove = true;
        if (candidate.quality > quality) {
          qualityUp = candidate.quality;
        }
      }
    } while (didRemove);

    let qualityDown = getNextCandidate(Infinity)?.quality;
    if (qualityDown != null && qualityDown === quality) {
      qualityDown -= 0.01;
    }

    const colorStopStrings = colors.map(({ r, g, b, a, p }) => {
      let color: string;
      switch (colorScale.colorProfile) {
        case "p3": {
          const p3Color = new Color({
            space: "p3",
            coords: [r, g, b],
            alpha: a,
          });
          const srgbColor = p3Color.to("srgb");
          const [srgbR, srgbG, srgbB] = srgbColor.coords;
          srgbColor.toGamut();

          const maxDelta = Math.max(
            Math.abs(srgbColor.coords[0] - srgbR),
            Math.abs(srgbColor.coords[1] - srgbG),
            Math.abs(srgbColor.coords[2] - srgbB)
          );

          color =
            maxDelta < 1 / 255
              ? srgbColor.toString({ format: "hex" })
              : p3Color.toString({ precision: 3 });
          break;
        }
        case "srgb": {
          color = new Color({
            space: "srgb",
            coords: [r, g, b],
            alpha: a,
          }).toString({
            format: "hex",
          });
          break;
        }
      }

      return `${color} ${Math.round(p * 100)}%`;
    });

    const colorStopsString = colorStopStrings.join(",");

    return { colorStopsString, qualityUp, qualityDown };
  }, [colorScale, quality]);

  return {
    css: `linear-gradient(${degrees}deg, ${colorStopsString})`,
    quality,
    qualityUp,
    qualityDown,
    setQuality,
  };
};
