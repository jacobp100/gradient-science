import { Fragment, useState } from "react";
import ColorScale from "./ColorScale";
import { useColorStops } from "./useColorStops";

import "./StopsExport.css";
import { PreviewBackground } from "./types";

enum Format {
  CSS = "css",
  RGB = "rgb",
  RGBA = "rgba",
}

const formatComponents: Record<Format, number> = {
  [Format.CSS]: 1,
  [Format.RGB]: 3,
  [Format.RGBA]: 4,
};

const copy = (value: string) => navigator.clipboard.writeText(value);
const join = (value: string | number[]) =>
  Array.isArray(value) ? value.join(", ") : value;
type Props = {
  colorScale: ColorScale;
  stops: number;
  previewBackground: PreviewBackground;
};

export const StopsExport = ({
  colorScale,
  stops,
  previewBackground,
}: Props) => {
  const [format, setFormat] = useState(Format.CSS);

  const colorStops = useColorStops(colorScale, stops);
  // eslint-disable-next-line array-callback-return
  const formattedColorStops = colorStops.map((colorStop): string | number[] => {
    switch (format) {
      case Format.CSS:
        if (colorScale.colorProfile === "srgb") {
          return colorStop.toString({ format: "hex" });
        } else {
          return colorStop.toString();
        }
      case Format.RGB:
        return colorStop.coords.map((c) => Math.round(c * 255));
      case Format.RGBA:
        return [
          ...colorStop.coords.map((c) => Math.round(c * 255)),
          Math.floor(colorStop.alpha * 100) / 100,
        ];
    }
  });

  return (
    <div>
      <label className="ColorStops__Header">
        <span className="StopsExport__Label">Format</span>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as any)}
        >
          <option value={Format.CSS}>CSS</option>
          <option value={Format.RGB}>RGB</option>
          <option value={Format.RGBA}>RGBA</option>
        </select>
      </label>
      <div
        className="StopsExport__Table"
        style={{ "--num-components": formatComponents[format] } as any}
      >
        {colorStops.map((colorStop, index) => {
          const formattedColorStop = formattedColorStops[index];
          return (
            <Fragment key={index}>
              <div
                className="StopsExport__Tab"
                style={{
                  // Linear gradient required make color overlay preview background
                  background: `linear-gradient(${colorStop.toString()}, ${colorStop.toString()}), ${previewBackground}`,
                }}
              />
              {Array.isArray(formattedColorStop) ? (
                formattedColorStop.map((component, index) => (
                  <span className="StopsExport__Component">
                    {component}
                    {index !== formattedColorStop.length - 1 ? "," : ""}
                  </span>
                ))
              ) : (
                <span>{formattedColorStop}</span>
              )}
              <button
                className="StopsExport__CopyRow"
                onClick={() => copy(join(formattedColorStop))}
              >
                Copy
              </button>
            </Fragment>
          );
        })}
      </div>
      <div className="ColorStops__Footer">
        <span className="StopsExport__Label">Copy as</span>
        <button
          onClick={() => {
            const out = formattedColorStops.flatMap((formatted) => {
              return Array.isArray(formatted)
                ? [formatted.join(", "), "\n"]
                : [formatted, "\n"];
            });
            out.pop();
            copy(out.join(""));
          }}
        >
          List
        </button>
        <button
          onClick={() => {
            const out = formattedColorStops.flatMap((formatted) => {
              return Array.isArray(formatted)
                ? [formatted.join(","), "\n"]
                : [formatted, ","];
            });
            out.pop();
            copy(out.join(""));
          }}
        >
          CSV
        </button>
        <button onClick={() => copy(JSON.stringify(formattedColorStops))}>
          JSON
        </button>
      </div>
    </div>
  );
};
