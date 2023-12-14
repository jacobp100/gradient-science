import Color from "colorjs.io";
import { ColorStop } from "./types";
import { NumericSlider } from "./NumericSlider";

import "./ColorStopEditor.css";

type ChanelConfig = {
  label: string;
  index: number;
  min: number;
  max: number;
  scale: number;
};

const chanelConfigs: Record<string, ChanelConfig[] | undefined> = {
  srgb: [
    { label: "R", index: 0, min: 0, max: 1, scale: 255 },
    { label: "G", index: 1, min: 0, max: 1, scale: 255 },
    { label: "B", index: 2, min: 0, max: 1, scale: 255 },
  ],
  hsl: [
    { label: "H", index: 0, min: 0, max: 360, scale: 1 },
    { label: "S", index: 1, min: 0, max: 100, scale: 1 },
    { label: "L", index: 2, min: 0, max: 100, scale: 1 },
  ],
  p3: [
    { label: "R", index: 0, min: 0, max: 1, scale: 255 },
    { label: "G", index: 1, min: 0, max: 1, scale: 255 },
    { label: "B", index: 2, min: 0, max: 1, scale: 255 },
  ],
  lab: [
    { label: "L", index: 0, min: 0, max: 1, scale: 1 },
    { label: "A", index: 1, min: -125, max: 125, scale: 1 },
    { label: "B", index: 2, min: -125, max: 125, scale: 1 },
  ],
  lch: [
    { label: "L", index: 0, min: 0, max: 100, scale: 1 },
    { label: "C", index: 1, min: 0, max: 150, scale: 1 },
    { label: "H", index: 2, min: 0, max: 360, scale: 1 },
  ],
  oklab: [
    { label: "L", index: 0, min: 0, max: 1, scale: 100 },
    { label: "A", index: 1, min: -0.4, max: 0.4, scale: 100 },
    { label: "B", index: 2, min: -0.4, max: 0.4, scale: 100 },
  ],
  oklch: [
    { label: "L", index: 0, min: 0, max: 1, scale: 100 },
    { label: "C", index: 1, min: 0, max: 0.4, scale: 100 },
    { label: "H", index: 2, min: 0, max: 360, scale: 1 },
  ],
};

type Props = {
  colorStops: ColorStop[];
  onChangeColorStops: (colorStops: ColorStop[]) => void;
  selectedId: string;
  onChangeSelectedId: (selectedId: string | undefined) => void;
};

export const ColorStopEditor = ({
  colorStops,
  onChangeColorStops,
  selectedId,
  onChangeSelectedId,
}: Props) => {
  const selectedIndex = colorStops.findIndex((stop) => stop.id === selectedId);
  const stop = colorStops[selectedIndex];
  const nextStop =
    selectedIndex < colorStops.length - 1
      ? colorStops[selectedIndex + 1]
      : undefined;
  const previousStop =
    selectedIndex > 0 ? colorStops[selectedIndex - 1] : undefined;

  let color = stop.color;
  let chanelConfig = chanelConfigs[color.spaceId];
  if (chanelConfig == null) {
    chanelConfig = chanelConfigs.srgb!;
    color = color.to("srgb");
  }

  const setColorSpace = (spaceId: string) => {
    const nextColor = color.to(spaceId);

    const nextStops = colorStops.slice();
    nextStops[selectedIndex] = { ...stop, color: nextColor };
    onChangeColorStops(nextStops);
  };

  const setChanelValue = (config: ChanelConfig, value: number) => {
    const nextCoords = color.coords.slice() as [number, number, number];
    nextCoords[config.index] = value;
    const nextColor = new Color({
      space: color.space,
      coords: nextCoords,
    });

    const nextStops = colorStops.slice();
    nextStops[selectedIndex] = { ...stop, color: nextColor };
    onChangeColorStops(nextStops);
  };

  const remove = () => {
    const nextStops = colorStops.slice();
    nextStops.splice(selectedIndex, 1);

    onChangeColorStops(nextStops);
  };

  return (
    <div className="ColorStopEditor">
      {chanelConfig.map((config) => (
        <NumericSlider
          key={config.label}
          label={config.label}
          min={config.min}
          max={config.max}
          scale={config.scale}
          value={color.coords[config.index]}
          onChange={(value) => setChanelValue(config, value)}
        />
      ))}
      <div className="ColorStopEditor__Footer">
        <select
          value={color.spaceId}
          onChange={(e) => setColorSpace(e.target.value)}
        >
          <option value="srgb">RGB</option>
          <option value="hsl">HSL</option>
          <option value="p3">Display P3</option>
          <option value="lab">LAB</option>
          <option value="lch">LCH</option>
          <option value="oklab">OKLAB</option>
          <option value="oklch">OKLCH</option>
        </select>
        <button onClick={remove}>Delete</button>
      </div>
    </div>
  );
};
