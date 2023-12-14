import { NumericSlider } from "./NumericSlider";
import { OpacityStop } from "./types";

type Props = {
  opacityStops: OpacityStop[];
  onChangeOpacityStops: (opacityStops: OpacityStop[]) => void;
  selectedId: string;
  onChangeSelectedId: (selectedId: string | undefined) => void;
};

export const OpacityEditor = ({
  opacityStops,
  onChangeOpacityStops,
  selectedId,
  onChangeSelectedId,
}: Props) => {
  const selectedIndex = opacityStops.findIndex(
    (stop) => stop.id === selectedId
  );
  const stop = opacityStops[selectedIndex];
  const nextStop =
    selectedIndex < opacityStops.length - 1
      ? opacityStops[selectedIndex + 1]
      : undefined;
  const previousStop =
    selectedIndex > 0 ? opacityStops[selectedIndex - 1] : undefined;

  const setAlpha = (alpha: number) => {
    const nextStops = opacityStops.slice();
    nextStops[selectedIndex] = { ...stop, alpha };
    onChangeOpacityStops(nextStops);
  };

  const remove = () => {
    const nextStops = opacityStops.slice();
    nextStops.splice(selectedIndex, 1);

    onChangeOpacityStops(nextStops);
  };

  return (
    <div>
      <NumericSlider
        label="A"
        min={0}
        max={1}
        scale={100}
        value={stop.alpha}
        onChange={setAlpha}
      />
      <button onClick={remove}>Delete</button>
    </div>
  );
};
