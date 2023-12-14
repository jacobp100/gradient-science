import React, { type Dispatch, type SetStateAction } from "react";

export const useStateConstraint = <S>(
  initialState: S | (() => S),
  getDerivedState: (state: S) => S
): [S, Dispatch<SetStateAction<S>>] => {
  const stateTuple = React.useState(initialState);
  const prevState = stateTuple[0];
  const nextState = getDerivedState(prevState);
  if (!Object.is(prevState, nextState)) {
    if (process.env.NODE_ENV === "development") {
      if (getDerivedState(nextState) !== nextState) {
        throw new Error("Expected useStateConstraint to return stable value");
      }
    }

    const setState = stateTuple[1];
    setState(nextState);
    return [nextState, setState];
  } else {
    return stateTuple;
  }
};
