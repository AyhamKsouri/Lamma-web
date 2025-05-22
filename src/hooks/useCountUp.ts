import { useEffect, useState } from "react";

/**
 * Smoothly count from 0 up to `end` over `duration` milliseconds.
 */
export function useCountUp(end: number, duration = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      setValue(Math.floor(percent * end));
      if (percent < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    return () => {
      // cancel frame?
      startTime = null;
    };
  }, [end, duration]);

  return value;
}
