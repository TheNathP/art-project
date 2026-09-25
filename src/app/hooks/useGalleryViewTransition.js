"use client";

import { useCallback, useEffect, useState } from "react";
import GalleryViewTransition from "@/app/animations/GalleryViewTransition";

export default function useGalleryViewTransition({ rootRef }) {
  const [viewMode, setViewMode] = useState("draggable");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animation] = useState(
    () =>
      new GalleryViewTransition({
        rootRef,
        onViewModeChange: setViewMode,
        onTransitionChange: setIsTransitioning,
      }),
  );

  const changeViewMode = useCallback(
    (nextViewMode) => {
      animation.changeViewMode(nextViewMode);
    },
    [animation],
  );

  useEffect(() => {
    animation.mount();

    return () => {
      animation.destroy();
    };
  }, [animation]);

  return {
    viewMode,
    isTransitioning,
    changeViewMode,
  };
}
