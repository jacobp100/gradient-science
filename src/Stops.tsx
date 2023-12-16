import ColorScale from "./ColorScale";
import { useColorStops } from "./useColorStops";

import "./Stops.css";

type Props = {
  width: number;
  height: number;
  colorScale: ColorScale;
  stops: number;
};

export const Stops = ({ width, height, colorScale, stops }: Props) => {
  const colorStops = useColorStops(colorScale, stops);

  return (
    <div className="Stops" style={{ width, height }}>
      {colorStops.map((stop, index) => (
        <div
          key={index}
          className="Stops__Stop"
          style={{ background: stop.toString() }}
        />
      ))}
    </div>
  );
};
