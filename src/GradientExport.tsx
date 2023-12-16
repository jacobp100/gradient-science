import { useRef } from "react";
import type { useCssExport } from "./useCssExport";

import "./GradientExport.css";

export const GradientExport = ({
  css,
  quality,
  qualityUp,
  qualityDown,
  setQuality,
}: ReturnType<typeof useCssExport>) => {
  const codeRef = useRef<HTMLParagraphElement>(null);

  return (
    <div className="GradientExport">
      <div className="GradientExport__Row">
        <span className="GradientExport__Label">
          <span className="GradientExport__Btyes">{css.length} bytes</span>
          <span className="GradientExport__Quality">
            {(quality * 100).toFixed(0)}% quality
          </span>
        </span>
        <button
          onClick={() => setQuality(qualityDown ?? quality)}
          disabled={qualityDown == null}
        >
          -
        </button>
        <button
          onClick={() => setQuality(qualityUp ?? quality)}
          disabled={qualityUp == null}
        >
          +
        </button>
      </div>
      <p
        ref={codeRef}
        className="GradientExport__Code"
        onClick={() => {
          const range = document.createRange();
          range.selectNodeContents(codeRef.current!);
          const sel = window.getSelection()!;
          sel.removeAllRanges();
          sel.addRange(range);
        }}
      >
        {css}
      </p>
      <button
        className="GradientExport__Copy"
        onClick={() => navigator.clipboard.writeText(css)}
      >
        Copy
      </button>
    </div>
  );
};
