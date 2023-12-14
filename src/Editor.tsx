import { ColorBar } from "./ColorBar";
import { ColorStopEditor } from "./ColorStopEditor";
import { ControlPointsBezizer } from "./ControlPointsBezier";
import { OpacityEditor } from "./OpacityEditor";
import {
  ColorProfile,
  ColorStop,
  ControlPoints,
  Mode,
  OpacityStop,
} from "./types";
import { useStateConstraint } from "./useStateConstraint";

import "./Editor.css";

export enum UIType {
  ColorStop,
  OpacityStop,
}

export type UI =
  | { type: UIType.ColorStop; id: string }
  | { type: UIType.OpacityStop; id: string };

type Props = {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
  colorProfile: ColorProfile;
  onChangeColorProfile: (colorProfile: ColorProfile) => void;
  colorStops: ColorStop[];
  onChangeColorStops: (colorStops: ColorStop[]) => void;
  opacityStops: OpacityStop[];
  onChangeOpacityStops: (opacityStops: OpacityStop[]) => void;
  controlPoints: ControlPoints;
  onChangeControlPoints: (controlPoints: ControlPoints) => void;
  degrees: number;
  onChangeDegrees: (degrees: number) => void;
  stops: number;
  onChangeStops: (degrees: number) => void;
};

export const Editor = ({
  mode,
  onChangeMode,
  colorProfile,
  onChangeColorProfile,
  colorStops,
  onChangeColorStops,
  opacityStops,
  onChangeOpacityStops,
  controlPoints,
  onChangeControlPoints,
  degrees,
  onChangeDegrees,
  stops,
  onChangeStops,
}: Props) => {
  const [ui, setUI] = useStateConstraint<UI | undefined>(undefined, (s) => {
    if (
      s?.type === UIType.ColorStop &&
      !colorStops.some((stop) => stop.id === s.id)
    ) {
      return undefined;
    } else if (
      s?.type === UIType.OpacityStop &&
      !opacityStops.some((stop) => stop.id === s.id)
    ) {
      return undefined;
    } else {
      return s;
    }
  });

  const selectedColorStopId = ui?.type === UIType.ColorStop ? ui.id : undefined;

  const selectedOpacityStopId =
    ui?.type === UIType.OpacityStop ? ui.id : undefined;

  return (
    <>
      <ColorBar
        width={200}
        colorProfile={colorProfile}
        colorStops={colorStops}
        onChangeColorStops={onChangeColorStops}
        selectedColorStopId={selectedColorStopId}
        onSelectColorStopId={(id) => {
          setUI(
            id !== selectedColorStopId
              ? { type: UIType.ColorStop, id }
              : undefined
          );
        }}
        opacityStops={opacityStops}
        onChangeOpacityStops={onChangeOpacityStops}
        selectedOpacityStopId={selectedOpacityStopId}
        onSelectOpacityStopId={(id) => {
          setUI(
            id !== selectedOpacityStopId
              ? { type: UIType.OpacityStop, id }
              : undefined
          );
        }}
      />
      {ui?.type === UIType.OpacityStop ? (
        <OpacityEditor
          opacityStops={opacityStops}
          onChangeOpacityStops={onChangeOpacityStops}
          selectedId={ui.id}
          onChangeSelectedId={(id) => {
            setUI(id != null ? { type: UIType.OpacityStop, id } : undefined);
          }}
        />
      ) : ui?.type === UIType.ColorStop ? (
        <ColorStopEditor
          colorStops={colorStops}
          onChangeColorStops={onChangeColorStops}
          selectedId={ui.id}
          onChangeSelectedId={(id) => {
            setUI(id != null ? { type: UIType.ColorStop, id } : undefined);
          }}
        />
      ) : (
        <>
          <ControlPointsBezizer
            width={200}
            height={200}
            controlPoints={controlPoints}
            onChangeControlPoints={onChangeControlPoints}
          />
          <label className="Editor__Field">
            <span className="Editor__FieldLabel">Mode</span>
            <select
              className="Editor__FieldValue"
              value={mode}
              onChange={(e) => onChangeMode(e.target.value as any)}
            >
              <option value={Mode.Gradient}>Gradient</option>
              <option value={Mode.Stops}>Stops</option>
            </select>
          </label>
          {mode === Mode.Gradient ? (
            <label className="Editor__Field">
              <span className="Editor__FieldLabel">Angle</span>
              <input
                className="Editor__FieldValue"
                type="range"
                value={degrees}
                onChange={(e) => onChangeDegrees(e.target.valueAsNumber)}
                min={0}
                max={360}
              />
            </label>
          ) : (
            <label className="Editor__Field">
              <span className="Editor__FieldLabel">Output Color</span>
              <input
                type="number"
                min={1}
                max={20}
                value={stops}
                onChange={(e) => onChangeStops(e.target.valueAsNumber)}
              />
            </label>
          )}
          <label className="Editor__Field">
            <span className="Editor__FieldLabel">Output Color</span>
            <select
              className="Editor__FieldValue"
              value={colorProfile}
              onChange={(e) => onChangeColorProfile(e.target.value as any)}
            >
              <option value="p3">Display P3</option>
              <option value="srgb">sRGB</option>
            </select>
          </label>
        </>
      )}
    </>
  );
};
