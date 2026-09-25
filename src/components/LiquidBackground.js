"use client";

import { useEffect, useRef } from "react";
import { FluidSimulation } from "../app/lib/fluid-simulation";

export default function LiquidBackground({
  children,
  height = "100vh",
  primaryColor,
  primaryColors,
  secondaryColors = ["aqua", "lime", "violet"],
  backgroundImage,
  hoverSize = 5,
  autoAnimation = true,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const backgroundRef = useRef(null);

  const [
    secondary1 = "aqua",
    secondary2 = secondary1,
    secondary3 = secondary1,
  ] = secondaryColors;
  const primaryColorsKey = Array.isArray(primaryColors)
    ? primaryColors.join("|")
    : "";
  const backgroundImageUrl =
    typeof backgroundImage === "string"
      ? backgroundImage
      : backgroundImage?.src;

  useEffect(() => {
    const simulation = new FluidSimulation(
      canvasRef.current,
      backgroundRef.current,
      {
        primaryColor,
        primaryColors: primaryColorsKey
          ? primaryColorsKey.split("|")
          : undefined,
        hoverSize,
        autoAnimation,
        eventTarget: rootRef.current,
      },
    );

    return () => simulation.destroy();
  }, [primaryColor, primaryColorsKey, hoverSize, autoAnimation]);

  return (
    <section
      ref={rootRef}
      className="liquid-root relative isolate w-full overflow-hidden"
      style={{
        height,
        "--liquid-secondary-1": secondary1,
        "--liquid-secondary-2": secondary2,
        "--liquid-secondary-3": secondary3,
      }}
    >
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className={`${backgroundImageUrl ? "" : "liquid-colors-animation"} liquid-color absolute left-1/2 top-1/2 h-[115%] w-screen -translate-x-1/2 -translate-y-1/2 bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-1000 ease-[ease]`}
        style={
          backgroundImageUrl
            ? { backgroundImage: `url("${backgroundImageUrl}")` }
            : undefined
        }
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative z-10 h-full w-full">{children}</div>

      <style>{`
        .liquid-colors-animation {
          animation: liquid-colors 15s infinite alternate;
        }

        @keyframes liquid-colors {
          0% { background-color: var(--liquid-secondary-1); }
          33% { background-color: var(--liquid-secondary-2); }
          66% { background-color: var(--liquid-secondary-3); }
          100% { background-color: var(--liquid-secondary-1); }
        }

        @media (min-aspect-ratio: 4/3) {
          .liquid-root .liquid-color {
            width: 100vw;
            height: 100%;
          }
        }

        @media (max-aspect-ratio: 3/5) {
          .liquid-root .liquid-color {
            left: 30%;
          }
        }
      `}</style>
    </section>
  );
}
