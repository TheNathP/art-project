"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ArtworkParallax from "@/app/animations/ArtworkParallax";

gsap.registerPlugin(useGSAP);

export default function useArtworkParallax({
  viewportRef,
  gridRef,
  artworksKey,
  enabled,
  maxOffset,
  maxScale,
  influenceRadius,
  followDuration,
}) {
  useGSAP(
    () => {
      const animation = new ArtworkParallax({
        viewport: viewportRef.current,
        grid: gridRef.current,
        enabled,
        maxOffset,
        maxScale,
        influenceRadius,
        followDuration,
      });

      animation.mount();

      return () => {
        animation.destroy();
      };
    },
    {
      dependencies: [
        artworksKey,
        enabled,
        maxOffset,
        maxScale,
        influenceRadius,
        followDuration,
      ],
      revertOnUpdate: true,
    },
  );
}
