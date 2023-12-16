import { IndexHeader } from "./IndexHeader";
import { NumericSlider } from "./NumericSlider";
import { OpacityStop } from "./types";
import { useKeyboardInput } from "./useKeyboardInput";

import "./OpacityStopEditor.css";

type Props = {
  opacityStops: OpacityStop[];
  onChangeOpacityStops: (opacityStops: OpacityStop[]) => void;
  selectedId: string;
  onChangeSelectedId: (selectedId: string | undefined) => void;
};

export const OpacityStopEditor = ({
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

  const setPosition = (position: number) => {
    const nextStops = opacityStops.slice();
    nextStops[selectedIndex] = { ...stop, position };
    onChangeOpacityStops(nextStops);
  };

  const setMidpoint = (midpoint: number) => {
    const nextStops = opacityStops.slice();
    nextStops[selectedIndex] = { ...stop, midpoint };
    onChangeOpacityStops(nextStops);
  };

  const remove = () => {
    const nextStops = opacityStops.slice();
    nextStops.splice(selectedIndex, 1);

    onChangeOpacityStops(nextStops);
  };

  useKeyboardInput((key) => {
    if (key === "Escape") {
      onChangeSelectedId(undefined);
      return true;
    } else if (key === "Backspace") {
      remove();
      return true;
    }
    return false;
  });

  return (
    <div className="OpacityStopEditor">
      <IndexHeader
        currentIndex={selectedIndex}
        totalIndices={opacityStops.length}
        previousId={previousStop?.id}
        nextId={nextStop?.id}
        onSelectId={onChangeSelectedId}
      />
      <NumericSlider
        label="A"
        min={0}
        max={1}
        scale={100}
        value={stop.alpha}
        onChange={setAlpha}
      />
      <NumericSlider
        label="%"
        min={0}
        max={1}
        scale={100}
        value={stop.position}
        onChange={setPosition}
      />
      <NumericSlider
        label="M"
        min={0}
        max={1}
        scale={100}
        disabled={nextStop == null}
        value={stop.midpoint}
        onChange={setMidpoint}
      />
      <div className="OpacityStopEditor__Footer">
        <button onClick={remove}>Delete</button>
      </div>
    </div>
  );
};
