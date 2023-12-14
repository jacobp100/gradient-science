import { useState } from "react";
import ColorScale from "./ColorScale";
import { Gradient } from "./Gradient";

import "./Preview.css";

type Props = {
  colorScale: ColorScale;
  angle: number;
  cssExport: string | undefined;
};

export const Preview = ({ colorScale, angle, cssExport }: Props) => {
  const [background, setBackground] = useState<string>("var(--checker-dark)");
  const [hideCssExport, setHideCssExport] = useState(false);

  return (
    <div className="Preview">
      <div
        className="Preview__Container"
        style={{ background }}
        onMouseDown={() => {
          setHideCssExport(true);
          const clear = () => {
            setHideCssExport(false);
            window.removeEventListener("mouseup", clear);
          };
          window.addEventListener("mouseup", clear);
        }}
      >
        <Gradient
          width={200}
          height={200}
          colorScale={colorScale}
          angle={angle}
        />
        {cssExport != null ? (
          <div
            className="Preview__Overlay"
            style={{
              background: `${cssExport}, ${background}`,
              opacity: hideCssExport ? 0 : 1,
            }}
          />
        ) : null}
        <select
          className="Preview__Select"
          value={background}
          onChange={(e) => setBackground(e.target.value as any)}
        >
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="var(--checker-light)">Checker Light</option>
          <option value="var(--checker-dark)">Checker Dark</option>
        </select>
      </div>
    </div>
  );
};
