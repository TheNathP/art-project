"use client";

import { useLayoutEffect, useRef } from "react";
import RollingNumberAnimation from "@/app/animations/RollingNumberAnimation";

function formatNumber(value, minimumDigits, prefix, suffix) {
  return `${prefix}${String(value).padStart(minimumDigits, "0")}${suffix}`;
}

export default function RollingNumber({
  value,
  minimumDigits = 0,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const rootRef = useRef(null);
  const currentRef = useRef(null);
  const previousValueRef = useRef(value);

  useLayoutEffect(() => {
    const previousValue = previousValueRef.current;

    if (previousValue === value) {
      return;
    }

    const animation = new RollingNumberAnimation({
      root: rootRef.current,
      current: currentRef.current,
    });

    animation.play({
      previousText: formatNumber(previousValue, minimumDigits, prefix, suffix),
      direction: value - previousValue,
    });
    previousValueRef.current = value;

    return () => animation.destroy();
  }, [minimumDigits, prefix, suffix, value]);

  const formattedValue = formatNumber(value, minimumDigits, prefix, suffix);

  return (
    <output
      ref={rootRef}
      aria-live="polite"
      className={`relative inline-grid overflow-hidden align-bottom leading-none ${className}`}
    >
      <span className="sr-only">{formattedValue}</span>
      <span
        ref={currentRef}
        aria-hidden="true"
        className="inline-block whitespace-nowrap"
      >
        {formattedValue}
      </span>
    </output>
  );
}
