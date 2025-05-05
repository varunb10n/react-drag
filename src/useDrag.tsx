// Note: In progress!
import { RefObject, useCallback, useEffect, useState } from "react";

interface UseDragProps {
  ref: RefObject<HTMLElement | null>;
}

interface Position {
  top: number;
  left: number;
}

interface DragInfo extends Position {
  clientX: number;
  clientY: number;
  width: number;
  height: number;
}

export const useDrag = (props: UseDragProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useState<Position>({
    left: 0,
    top: 0,
  });

  const [dragInfo, setDragInfo] = useState<DragInfo>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    clientX: 0,
    clientY: 0,
  });

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const el = props.ref.current;

      if (!el) return;

      event.preventDefault();

      setIsDragging(true);

      const { top, left, width, height } = el.getBoundingClientRect();

      setDragInfo({
        height,
        width,
        left,
        top,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [props.ref]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const el = props.ref.current;

      if (!isDragging || !el) return;

      event.preventDefault();

      const deltaX = event.clientX - dragInfo.clientX;

      const deltaY = event.clientY - dragInfo.clientY;

      setPosition({
        left: Math.min(
          Math.max(0, deltaX + dragInfo.left),
          window.innerWidth - dragInfo.width
        ),
        top: Math.min(
          Math.max(0, deltaY + dragInfo.top),
          window.innerHeight - dragInfo.height
        ),
      });
    },
    [dragInfo, isDragging, props.ref]
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove, { passive: false });

    document.addEventListener("pointerup", handleMouseUp);
    document.addEventListener("pointermove", handleMouseMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);

      document.removeEventListener("pointerup", handleMouseUp);
      document.removeEventListener("pointermove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const el = props.ref.current;

    if (!el) return;

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("pointerdown", handleMouseDown);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("pointerdown", handleMouseDown);
    };
  }, [handleMouseDown, props.ref]);

  return { position };
};
