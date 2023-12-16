import { useState } from "react";
import ColorScale from "./ColorScale";
import { Gradient } from "./Gradient";
import { Stops } from "./Stops";
import { Mode, PreviewBackground } from "./types";

import "./Preview.css";
import classNames from "classnames";

type Props = {
  className: string;
  mode: Mode;
  colorScale: ColorScale;
  angle: number;
  stops: number;
  cssExport: string | undefined;
  previewBackground: PreviewBackground;
  onChangePreviewBackground: (previewBackground: PreviewBackground) => void;
};

const size = 200;

export const Preview = ({
  className,
  mode,
  colorScale,
  angle,
  stops,
  cssExport,
  previewBackground,
  onChangePreviewBackground,
}: Props) => {
  // const [background, setBackground] = useState<string>("var(--checker-dark)");
  const [hideCssExport, setHideCssExport] = useState(false);

  return (
    <div className={classNames("Preview", className)}>
      <div
        className="Preview__Container"
        style={{ background: previewBackground }}
        onMouseDown={() => {
          setHideCssExport(true);
          const clear = () => {
            setHideCssExport(false);
            window.removeEventListener("mouseup", clear);
          };
          window.addEventListener("mouseup", clear);
        }}
      >
        {mode === Mode.Gradient ? (
          <Gradient
            width={size}
            height={size}
            colorScale={colorScale}
            angle={angle}
          />
        ) : (
          <Stops
            width={size}
            height={size}
            colorScale={colorScale}
            stops={stops}
          />
        )}
        {cssExport != null ? (
          <div
            className="Preview__Overlay"
            style={{
              background: `${cssExport}, ${previewBackground}`,
              opacity: hideCssExport ? 0 : 1,
            }}
          />
        ) : null}
        <select
          className="Preview__Select"
          value={previewBackground}
          onChange={(e) => onChangePreviewBackground(e.target.value as any)}
        >
          <option value={PreviewBackground.Black}>Black</option>
          <option value={PreviewBackground.White}>White</option>
          <option value={PreviewBackground.CheckerLight}>Checker Light</option>
          <option value={PreviewBackground.CheckerDark}>Checker Dark</option>
        </select>
      </div>
    </div>
  );
};
