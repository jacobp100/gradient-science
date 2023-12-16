import { useMemo } from "react";
import ColorScale from "./ColorScale";

export const useColorStops = (colorScale: ColorScale, stops: number) => {
  return useMemo(() => {
    if (stops === 0) {
      return [];
    } else if (stops === 1) {
      return [colorScale.at(0.5)];
    }

    return Array.from({ length: stops }, (_, index) => {
      return colorScale.at(index / (stops - 1));
    });
  }, [colorScale, stops]);
};
