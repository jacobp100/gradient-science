import "./IndexHeader.css";

type Props = {
  currentIndex: number;
  totalIndices: number;
  previousId: string | undefined;
  nextId: string | undefined;
  onSelectId: (id: string | undefined) => void;
};

export const IndexHeader = ({
  currentIndex,
  totalIndices,
  previousId,
  nextId,
  onSelectId,
}: Props) => (
  <div className={"IndexHeader"}>
    <div className="IndexHeader__Aside">
      <button onClick={() => onSelectId(undefined)}>Close</button>
    </div>
    <span className="IndexHeader__Title">
      {currentIndex + 1}/{totalIndices}
    </span>
    <div className="IndexHeader__Aside IndexHeader__Aside--right">
      <button
        onClick={() => onSelectId(previousId)}
        disabled={previousId == null}
      >
        &larr;
      </button>
      <button onClick={() => onSelectId(nextId)} disabled={nextId == null}>
        &rarr;
      </button>
    </div>
  </div>
);
