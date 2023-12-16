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
  PreviewBackground,
} from "./types";
import { useCssExport } from "./useCssExport";

import "./App.css";
import classNames from "classnames";

enum UI {
  Editor,
  Export,
}

export const App = () => {
  const [ui, setUI] = useState(UI.Editor);
  const [mode, setMode] = useState(Mode.Gradient);
  const [colorProfile, setColorProfile] = useState<ColorProfile>("srgb");
  const [colorStops, setColorStops] = useState<ColorStop[]>(() => []);
  const [opacityStops, setOpacityStops] = useState<OpacityStop[]>(() => []);
  const [controlPoints, setControlPoints] = useState<ControlPoints>(() => ({
    p1x: 0.25,
    p1y: 0.25,
    p2x: 0.75,
    p2y: 0.75,
  }));
  const [_degrees, setDegrees] = useState(0);
  const [stops, setStops] = useState(5);
  const [previewBackground, setPreviewBackground] = useState(
    PreviewBackground.CheckerDark
  );

  const degrees = mode === Mode.Gradient ? _degrees : 90;

  const colorScale = useMemo(() => {
    return new ColorScale(
      colorProfile,
      colorStops,
      opacityStops,
      controlPoints
    );
  }, [colorProfile, colorStops, opacityStops, controlPoints]);

  const cssExport = useCssExport({ colorScale, degrees });

  return (
    <div className="App">
      <div className="App__Header">
        <button
          className={classNames(
            "App__HeaderButton",
            ui === UI.Editor && "App__HeaderButton--active"
          )}
          onClick={() => setUI(UI.Editor)}
        >
          Editor
        </button>
        <button
          className={classNames(
            "App__HeaderButton",
            ui === UI.Export && "App__HeaderButton--active"
          )}
          onClick={() => setUI(UI.Export)}
        >
          Export
        </button>
      </div>
      <Preview
        className="App__Preview"
        mode={mode}
        colorScale={colorScale}
        angle={(degrees * Math.PI) / 180}
        stops={stops}
        cssExport={
          ui === UI.Export && mode === Mode.Gradient ? cssExport.css : undefined
        }
        previewBackground={previewBackground}
        onChangePreviewBackground={setPreviewBackground}
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
        <StopsExport
          colorScale={colorScale}
          stops={stops}
          previewBackground={previewBackground}
        />
      )}
    </div>
  );
};
