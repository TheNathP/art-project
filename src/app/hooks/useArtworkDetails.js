"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useState } from "react";
import ArtworkDetailsAnimation from "@/app/animations/ArtworkDetailsAnimation";

gsap.registerPlugin(useGSAP);

export default function useArtworkDetails({
  overlayRef,
  surfaceRef,
  backdropRef,
  imageSlotRef,
  contentRef,
}) {
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [animation] = useState(
    () =>
      new ArtworkDetailsAnimation({
        overlayRef,
        surfaceRef,
        backdropRef,
        imageSlotRef,
        contentRef,
      }),
  );

  const openArtwork = useCallback(
    (artwork, artworkElement) => {
      if (animation.prepare(artworkElement)) {
        setSelectedArtwork(artwork);
      }
    },
    [animation],
  );

  const { contextSafe } = useGSAP(
    () => {
      if (!selectedArtwork) {
        animation.hide();
        return;
      }

      return animation.open();
    },
    {
      dependencies: [selectedArtwork?.id, animation],
      revertOnUpdate: true,
    },
  );

  const closeArtwork = contextSafe(() => {
    if (!selectedArtwork) {
      return;
    }

    animation.close({
      onComplete: () => setSelectedArtwork(null),
    });
  });

  useEffect(() => {
    return () => {
      animation.destroy();
    };
  }, [animation]);

  return {
    selectedArtwork,
    openArtwork,
    closeArtwork,
  };
}
