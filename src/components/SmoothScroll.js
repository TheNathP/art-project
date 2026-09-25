"use client";

import { ReactLenis } from "lenis/react";

const LENIS_OPTIONS = {
  autoRaf: true,
  autoToggle: true,
  smoothWheel: true,
  stopInertiaOnNavigate: true,
  respectReducedMotion: true,
};

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
