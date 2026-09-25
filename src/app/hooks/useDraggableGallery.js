"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import DraggableGallery from "@/app/animations/DraggableGallery";

gsap.registerPlugin(useGSAP);

export default function useDraggableGallery({
  viewportRef,
  gridRef,
  artworksKey,
  enabled = true,
  suspendCardEffects = false,
  filterTransitioning = false,
}) {
  const draggedRef = useRef(false);
  const hasPlayedIntroRef = useRef(false);
  const hasPlayedRevealRef = useRef(false);
  const animationRef = useRef(null);

  useGSAP(
    () => {
      let animation = null;
      let mountFrame = null;

      const mountAnimation = () => {
        animation = new DraggableGallery({
          viewport: viewportRef.current,
          grid: gridRef.current,
          draggedRef,
          hasPlayedIntroRef,
          hasPlayedRevealRef,
          enabled,
          suspendCardEffects: suspendCardEffects || filterTransitioning,
        });

        animation.mount();
        animationRef.current = animation;
      };

      if (suspendCardEffects) {
        mountFrame = window.requestAnimationFrame(mountAnimation);
      } else {
        mountAnimation();
      }

      return () => {
        window.cancelAnimationFrame(mountFrame);
        animation?.destroy();

        if (animationRef.current === animation) {
          animationRef.current = null;
        }
      };
    },
    {
      scope: viewportRef,
      dependencies: [artworksKey, enabled, suspendCardEffects],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (!filterTransitioning) {
      animationRef.current?.resumeCardEffects();
    }
  }, [filterTransitioning]);

  return draggedRef;
}
