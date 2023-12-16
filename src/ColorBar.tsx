import classNames from "classnames";
import Color from "colorjs.io";
import { Fragment, useMemo, useRef } from "react";
import ColorScale, { mixOklch } from "./ColorScale";
import { Gradient } from "./Gradient";
import { beginMouseDragInteraction } from "./beginMouseDragInteraction";
import { generateId } from "./generateId";
import { firstElement, lastElement } from "./orderedArray";
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

type BlobProps = Pick<
  React.SVGProps<SVGSVGElement>,
  "onMouseDown" | "onDoubleClick"
> & {
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
  onDoubleClick,
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
    onDoubleClick={onDoubleClick}
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

type LozengeProps = Pick<React.SVGProps<SVGSVGElement>, "onMouseDown"> & {
  position: number;
};

const Lozenge = ({ position, onMouseDown }: LozengeProps) => (
  <svg
    width={16}
    height={24}
    viewBox="0 0 16 24"
    className={"ColorBar__Lozenge"}
    style={{ "--position": position } as any}
    onMouseDown={onMouseDown}
  >
    <path d="M8 9L11 12L8 15L5 12Z" fill="#666" stroke="#888" />
  </svg>
);

type SliderBarProps = {
  title: string;
  stops: Array<{
    id: string;
    color: string;
    position: number;
    midpoint: number;
  }>;
  selectedId: string | undefined;
  direction: "up" | "down";
  onSelect: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onMoveMidpoint: (id: string, midpoint: number) => void;
  onInsert: (position: number) => void;
  onRemove: (id: string) => void;
};

const SliderBar = ({
  title,
  stops,
  selectedId,
  direction,
  onSelect,
  onMove,
  onMoveMidpoint,
  onInsert,
  onRemove,
}: SliderBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="ColorBar__Stops"
      onDoubleClick={(e) => {
        const { left, width } = containerRef.current!.getBoundingClientRect();
        onInsert((e.pageX - left) / width);
      }}
    >
      {stops.map(({ id, color, position, midpoint }, index) => {
        const nextPosition =
          index < stops.length - 1 ? stops[index + 1].position : undefined;
        return (
          <Fragment key={id}>
            <Blob
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
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(id);
              }}
            />
            {nextPosition != null ? (
              <Lozenge
                position={position + (nextPosition - position) * midpoint}
                onMouseDown={(e) => {
                  beginMouseDragInteraction(e, containerRef.current!, {
                    onDrag({ x }) {
                      const midpoint = Math.min(
                        Math.max((x - position) / (nextPosition - position), 0),
                        1
                      );
                      onMoveMidpoint(id, midpoint);
                    },
                  });
                }}
              />
            ) : null}
          </Fragment>
        );
      })}
      {stops.length === 0 ? (
        <span className="ColorBar__Label">Double click to add {title}</span>
      ) : null}
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
    return new ColorScale(colorProfile, colorStops, [], undefined);
  }, [colorProfile, colorStops]);

  return (
    <div
      ref={containerRef}
      className="ColorBar"
      style={{ "--container-width": `${width}px` } as any}
    >
      {svgDefs}
      <SliderBar
        title="opacity stop"
        stops={opacityStops.map((c) => ({
          id: c.id,
          color: `rgba(0, 0, 0, ${c.alpha})`,
          position: c.position,
          midpoint: c.midpoint,
        }))}
        selectedId={selectedOpacityStopId}
        direction="down"
        onSelect={onSelectOpacityStopId}
        onMove={(id, position) => {
          const nextOpacityStops = opacityStops
            .map((stop) => (stop.id === id ? { ...stop, position } : stop))
            .sort((a, b) => a.position - b.position);
          onChangeOpacityStops(nextOpacityStops);
        }}
        onMoveMidpoint={(id, midpoint) => {
          const nextOpacityStops = opacityStops.map((stop) =>
            stop.id === id ? { ...stop, midpoint } : stop
          );
          onChangeOpacityStops(nextOpacityStops);
        }}
        onInsert={(position) => {
          const stopBefore = lastElement(
            opacityStops,
            (s) => s.position < position
          );
          const stopAfter = firstElement(
            opacityStops,
            (s) => s.position > position
          );
          let alpha: number;
          if (stopBefore != null && stopAfter != null) {
            const d =
              (position - stopBefore.position) /
              (stopAfter.position - stopBefore.position);
            alpha = stopBefore.alpha + (stopAfter.alpha - stopBefore.alpha) * d;
          } else {
            alpha = stopBefore?.alpha ?? stopAfter?.alpha ?? 1;
          }

          const nextOpacityStops = opacityStops
            .concat({
              id: generateId(),
              alpha,
              position,
              midpoint: 0.5,
            })
            .sort((a, b) => a.position - b.position);
          onChangeOpacityStops(nextOpacityStops);
        }}
        onRemove={(id) => {
          const nextOpacityStops = opacityStops.filter((s) => s.id !== id);
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
        title="color stop"
        stops={colorStops.map((c) => ({
          id: c.id,
          color: c.color.toString(),
          position: c.position,
          midpoint: c.midpoint,
        }))}
        selectedId={selectedColorStopId}
        direction="up"
        onSelect={onSelectColorStopId}
        onMove={(id, position) => {
          const nextColorStops = colorStops
            .map((stop) => (stop.id === id ? { ...stop, position } : stop))
            .sort((a, b) => a.position - b.position);
          onChangeColorStops(nextColorStops);
        }}
        onMoveMidpoint={(id, midpoint) => {
          const nextColorStops = colorStops.map((stop) =>
            stop.id === id ? { ...stop, midpoint } : stop
          );
          onChangeColorStops(nextColorStops);
        }}
        onInsert={(position) => {
          const stopBefore = lastElement(
            colorStops,
            (s) => s.position < position
          );
          const stopAfter = firstElement(
            colorStops,
            (s) => s.position > position
          );
          let color: Color;
          if (stopBefore != null && stopAfter != null) {
            const d =
              (position - stopBefore.position) /
              (stopAfter.position - stopBefore.position);
            color = mixOklch(
              d,
              stopBefore.color.to("oklch"),
              stopAfter.color.to("oklch")
            );

            if (stopBefore.color.spaceId === stopAfter.color.spaceId) {
              color = color.to(stopBefore.color.spaceId);
            }
          } else {
            color = stopBefore?.color ?? stopAfter?.color ?? new Color("black");
          }

          const nextColorStops = colorStops
            .concat({
              id: generateId(),
              color,
              position,
              midpoint: 0.5,
            })
            .sort((a, b) => a.position - b.position);

          onChangeColorStops(nextColorStops);
        }}
        onRemove={(id) => {
          const nextColorStops = colorStops.filter((s) => s.id !== id);
          onChangeColorStops(nextColorStops);
        }}
      />
    </div>
  );
};
