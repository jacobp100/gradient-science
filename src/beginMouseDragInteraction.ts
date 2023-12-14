type Props = {
  minDistance?: number;
  onStart?: (coords: { x: number; y: number }) => void;
  onSelect?: () => void;
  onDrag: (coords: { x: number; y: number }) => void;
};

export const beginMouseDragInteraction = (
  e: React.MouseEvent<SVGElement, MouseEvent>,
  container: HTMLElement | SVGElement,
  { minDistance = 3, onStart, onSelect, onDrag }: Props
) => {
  const { pageX: startPageX, pageY: startPageY } = e;
  e.preventDefault();

  const { top, left, width, height } = container.getBoundingClientRect();

  let dragging = false;

  const coords = (e: MouseEvent) => ({
    x: Math.min(Math.max((e.pageX - left) / width, 0), 1),
    y: Math.min(Math.max((e.pageY - top) / height, 0), 1),
  });

  onStart?.(coords(e.nativeEvent));

  const mouseMove = (e: MouseEvent) => {
    dragging ||=
      Math.hypot(e.pageX - startPageX, e.pageY - startPageY) > minDistance;
    if (!dragging) return;

    onDrag(coords(e));
  };

  const mouseUp = () => {
    if (!dragging) {
      onSelect?.();
    }
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
  };

  window.addEventListener("mousemove", mouseMove);
  window.addEventListener("mouseup", mouseUp);
};
