import classNames from "classnames";
import { useMemo, useRef } from "react";
import ColorScale from "./ColorScale";
import { Gradient } from "./Gradient";
import { beginMouseDragInteraction } from "./beginMouseDragInteraction";
import { ColorProfile, ColorStop, OpacityStop } from "./types";

import "./ColorBar.css";

const svgDefs = (
  <svg width={0} height={0}>
    <defs>
      <pattern
        id="ColorBar__check"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <rect x="0" y="0" width="8" height="8" fill="white" />
        <path d="M0 0H4V8H8V4H0Z" fill="silver" />
      </pattern>
    </defs>
  </svg>
);

type BlobProps = Pick<React.SVGProps<SVGSVGElement>, "onMouseDown"> & {
  color: string;
  position: number;
  selected: boolean;
  direction: "up" | "down";
};

const Blob = ({
  color,
  position,
  direction,
  selected,
  onMouseDown,
}: BlobProps) => (
  <svg
    width={20}
    height={24}
    viewBox="-2 -2 20 24"
    className={classNames(
      "ColorBar__Stop",
      direction === "up" && "ColorBar__Stop--up"
    )}
    style={{ "--position": position } as any}
    onMouseDown={onMouseDown}
  >
    <path
      d="M8 0A8 8 0 0 0 .069 9.053C.848 15.083 8 20 8 20s7.152-4.917 7.931-10.947A8 8 0 0 0 8 0Z"
      fill={selected ? "#fafafa" : "#444"}
      stroke={selected ? "#fff" : "#555"}
      strokeWidth={1.5}
    />
    <circle cx={8} cy={8} r={7} fill={`url(#ColorBar__check)`} />
    <circle
      cx={8}
      cy={8}
      r={7}
      fill={color}
      stroke={selected ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.2)"}
    />
  </svg>
);

type SliderBarProps = {
  stops: Array<{ id: string; color: string; position: number }>;
  selectedId: string | undefined;
  direction: "up" | "down";
  onSelect: (id: string) => void;
  onMove: (id: string, position: number) => void;
};

const SliderBar = ({
  stops,
  selectedId,
  direction,
  onSelect,
  onMove,
}: SliderBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="ColorBar__Stops">
      {stops.map(({ id, color, position }) => (
        <Blob
          key={id}
          color={color}
          position={position}
          selected={id === selectedId}
          direction={direction}
          onMouseDown={(e) => {
            beginMouseDragInteraction(e, containerRef.current!, {
              onSelect() {
                onSelect(id);
              },
              onDrag({ x }) {
                onMove(id, x);
              },
            });
          }}
        />
      ))}
    </div>
  );
};

type Props = {
  width: number;
  colorProfile: ColorProfile;
  colorStops: ColorStop[];
  onChangeColorStops: (value: ColorStop[]) => void;
  selectedColorStopId: string | undefined;
  onSelectColorStopId: (id: string) => void;
  opacityStops: OpacityStop[];
  onChangeOpacityStops: (value: OpacityStop[]) => void;
  selectedOpacityStopId: string | undefined;
  onSelectOpacityStopId: (id: string) => void;
};

export const ColorBar = ({
  width,
  colorProfile,
  colorStops,
  onChangeColorStops,
  selectedColorStopId,
  onSelectColorStopId,
  opacityStops,
  onChangeOpacityStops,
  selectedOpacityStopId,
  onSelectOpacityStopId,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const colorScale = useMemo(() => {
    return new ColorScale(colorProfile, colorStops, [], undefined, undefined);
  }, [colorProfile, colorStops]);

  return (
    <div
      ref={containerRef}
      className="ColorBar"
      style={{ "--container-width": `${width}px` } as any}
    >
      {svgDefs}
      <SliderBar
        stops={opacityStops.map((c) => ({
          id: c.id,
          color: `rgba(0, 0, 0, ${c.alpha})`,
          position: c.position,
        }))}
        selectedId={selectedOpacityStopId}
        direction="down"
        onSelect={onSelectOpacityStopId}
        onMove={(id, position) => {
          const nextOpacityStops = opacityStops.map((stop) =>
            stop.id === id ? { ...stop, position } : stop
          );
          onChangeOpacityStops(nextOpacityStops);
        }}
      />
      <Gradient
        width={width}
        height={25}
        colorScale={colorScale}
        angle={Math.PI / 2}
        className="ColorBar__Gradient"
      />
      <SliderBar
        stops={colorStops.map((c) => ({
          id: c.id,
          color: c.color.toString(),
          position: c.position,
        }))}
        selectedId={selectedColorStopId}
        direction="up"
        onSelect={onSelectColorStopId}
        onMove={(id, position) => {
          const nextColorStops = colorStops.map((stop) =>
            stop.id === id ? { ...stop, position } : stop
          );
          onChangeColorStops(nextColorStops);
        }}
      />
    </div>
  );
};
