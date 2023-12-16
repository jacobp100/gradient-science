import { useEffect, useRef } from "react";

export const useKeyboardInput = (callback: (e: string) => boolean) => {
  let callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (callbackRef.current(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keypress", handler);
    return () => {
      window.removeEventListener("keypress", handler);
    };
  }, []);
};
