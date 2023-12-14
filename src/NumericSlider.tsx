import "./NumericSlider.css";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  scale?: number;
  onChange: (value: number) => void;
};

export const NumericSlider = ({
  label,
  value: _value,
  min,
  max,
  scale = 1,
  onChange,
}: Props) => {
  const roundValue = (v: number) =>
    scale != null
      ? Math.min(Math.max(Math.round(v * scale), min * scale), max * scale)
      : v;

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(roundValue(e.target.valueAsNumber / scale) / scale);
  };

  const value = roundValue(_value);

  return (
    <div className="NumericSlider">
      <input
        className="NumericSlider__Range"
        type="range"
        min={min * scale}
        max={max * scale}
        value={value}
        onChange={changeHandler}
      />
      <label className="NumericSlider__Inner">
        <span className="NumericSlider__Label">{label}</span>
        <input
          className="NumericSlider__Value"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={changeHandler}
        />
      </label>
    </div>
  );
};
