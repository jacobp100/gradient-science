import Color from "colorjs.io";
import { useMemo, useState } from "react";
import ColorScale from "./ColorScale";
import { Editor } from "./Editor";
import { GradientExport } from "./GradientExport";
import { Preview } from "./Preview";
import { StopsExport } from "./StopsExport";
import {
  ColorProfile,
  ColorStop,
  ControlPoints,
  Mode,
  OpacityStop,
} from "./types";
import { useCssExport } from "./useCssExport";

import "./App.css";

enum UI {
  Editor,
  Export,
}

export const App = () => {
  const [ui, setUI] = useState(UI.Editor);
  const [mode, setMode] = useState(Mode.Gradient);
  const [colorProfile, setColorProfile] = useState<ColorProfile>("p3");
  const [colorStops, setColorStops] = useState<ColorStop[]>(() => [
    { id: "1", color: new Color("#800"), position: 0, midpoint: 0.5 },
    { id: "2", color: new Color("#080"), position: 0.5, midpoint: 0.5 },
    { id: "3", color: new Color("#008"), position: 1, midpoint: 0.5 },
  ]);
  const [opacityStops, setOpacityStops] = useState<OpacityStop[]>(() => [
    { id: "4", alpha: 1, position: 0, midpoint: 0.5 },
    { id: "5", alpha: 0, position: 1, midpoint: 0.5 },
  ]);
  const [controlPoints, setControlPoints] = useState<ControlPoints>(() => ({
    p1x: 0.25,
    p1y: 0.25,
    p2x: 0.75,
    p2y: 0.75,
  }));
  const [_degrees, setDegrees] = useState(0);
  const [stops, setStops] = useState(5);

  const degrees = mode === Mode.Gradient ? _degrees : 90;

  const colorScale = useMemo(() => {
    return new ColorScale(
      colorProfile,
      colorStops,
      opacityStops,
      controlPoints,
      mode === Mode.Gradient ? undefined : stops
    );
  }, [mode, colorProfile, colorStops, opacityStops, controlPoints, stops]);

  const cssExport = useCssExport({ colorScale, degrees });

  return (
    <div className="App">
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setUI(UI.Editor)}>Editor</button>
        <button onClick={() => setUI(UI.Export)}>Export</button>
      </div>
      <Preview
        colorScale={colorScale}
        angle={(degrees * Math.PI) / 180}
        cssExport={
          ui === UI.Export && mode === Mode.Gradient ? cssExport.css : undefined
        }
      />
      {ui === UI.Editor ? (
        <Editor
          mode={mode}
          onChangeMode={setMode}
          colorProfile={colorProfile}
          onChangeColorProfile={setColorProfile}
          colorStops={colorStops}
          onChangeColorStops={setColorStops}
          opacityStops={opacityStops}
          onChangeOpacityStops={setOpacityStops}
          controlPoints={controlPoints}
          onChangeControlPoints={setControlPoints}
          degrees={degrees}
          onChangeDegrees={setDegrees}
          stops={stops}
          onChangeStops={setStops}
        />
      ) : mode === Mode.Gradient ? (
        <GradientExport {...cssExport} />
      ) : (
        <StopsExport />
      )}
    </div>
  );
};
