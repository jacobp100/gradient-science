import { useMemo, useRef } from "react";
import { beginMouseDragInteraction } from "./beginMouseDragInteraction";
import { ControlPoints } from "./types";

import "./ControlPointsBezier.css";

type Props = {
  width: number;
  height: number;
  controlPoints: ControlPoints;
  onChangeControlPoints: (value: ControlPoints) => void;
};

const toHalfPixel = (x: number) => Math.trunc(x / 2) * 2 + 0.5;

const presets: Record<string, ControlPoints> = {
  Linear: { p1x: 0.25, p1y: 0.25, p2x: 0.75, p2y: 0.75 },
  "Ease In": { p1x: 0.42, p1y: 0, p2x: 1, p2y: 1 },
  "Ease Out": { p1x: 0, p1y: 0, p2x: 0.58, p2y: 1 },
  "Ease In Out": { p1x: 0.42, p1y: 0, p2x: 0.58, p2y: 1 },
};

export const ControlPointsBezizer = ({
  width,
  height,
  controlPoints,
  onChangeControlPoints,
}: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  let preset = "";
  for (const key in presets) {
    if (controlPoints === presets[key]) {
      preset = key;
      break;
    }
  }

  const cp0x = 0;
  const cp0y = height;
  const cp1x = controlPoints.p1x * width;
  const cp1y = (1 - controlPoints.p1y) * height;
  const cp2x = controlPoints.p2x * width;
  const cp2y = (1 - controlPoints.p2y) * height;
  const cp3x = width;
  const cp3y = 0;

  const backgroundData = useMemo(() => {
    const x0 = 0.5;
    const y0 = 0.5;
    const innerWidth = width - 1;
    const innerHeight = height - 1;

    let content: string[] = [];

    content.push(`M${x0} ${y0}h${innerWidth}v${innerHeight}H${x0}Z`);

    const stops = 4;
    for (let stop = 1; stop < stops; stop += 1) {
      content.push(
        `M${toHalfPixel(x0 + (stop * innerWidth) / stops)} ${y0}v${innerHeight}`
      );
    }
    for (let stop = 1; stop < stops; stop += 1) {
      content.push(
        `M${x0} ${toHalfPixel(y0 + (stop * innerHeight) / stops)}h${innerWidth}`
      );
    }
    return content.join("");
  }, [width, height]);

  const svg = (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      className="ControlPointsBezier__Svg"
      onMouseDown={(e) => {
        let cp: 1 | 2 | undefined;
        const update = ({ x, y }: { x: number; y: number }) => {
          if (cp === 1) {
            onChangeControlPoints({ ...controlPoints, p1x: x, p1y: 1 - y });
          } else if (cp === 2) {
            onChangeControlPoints({ ...controlPoints, p2x: x, p2y: 1 - y });
          }
        };

        beginMouseDragInteraction(e, ref.current!, {
          minDistance: 0,
          onStart(coords) {
            const { x, y } = coords;
            const d1 = Math.hypot(
              x - controlPoints.p1x,
              1 - y - controlPoints.p1y
            );
            const d2 = Math.hypot(
              x - controlPoints.p2x,
              1 - y - controlPoints.p2y
            );
            if (Math.min(d1, d2) > 0.25) return;
            cp = d1 <= d2 ? 1 : 2;
            update(coords);
          },
          onDrag: update,
        });
      }}
    >
      <path d={backgroundData} fill="none" stroke="#333" />
      <path
        d={`M${cp0x} ${cp0y}C${cp1x} ${cp1y},${cp2x} ${cp2y},${cp3x} ${cp3y}`}
        fill="none"
        stroke="white"
      />
      <path
        d={`M${cp0x} ${cp0y}L${cp1x} ${cp1y}M${cp3x} ${cp3y}L${cp2x} ${cp2y}`}
        fill="none"
        stroke="white"
      />
      <circle cx={cp1x} cy={cp1y} r={6} fill="#aaa" stroke="#ccc" />
      <circle cx={cp2x} cy={cp2y} r={6} fill="#aaa" stroke="#ccc" />
    </svg>
  );

  return (
    <div className="ControlPointsBezier">
      {svg}
      <select
        className="ControlPointsBezier__Select"
        onChange={(e) => {
          const key = e.target.value;
          if (key !== "") {
            onChangeControlPoints(presets[key]);
          }
        }}
        value={preset}
      >
        <option value="" disabled>
          Presets
        </option>
        {Object.keys(presets).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};
