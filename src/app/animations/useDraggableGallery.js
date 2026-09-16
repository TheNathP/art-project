"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Draggable from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

const OVERSCROLL = 80;

function getAxisBounds(viewportSize, contentSize) {
  const overflow = contentSize - viewportSize;

  if (overflow <= 0) {
    const center = (viewportSize - contentSize) / 2;

    return {
      min: center - OVERSCROLL,
      max: center + OVERSCROLL,
      center,
    };
  }

  return {
    min: viewportSize - contentSize - OVERSCROLL,
    max: OVERSCROLL,
    center: (viewportSize - contentSize) / 2,
  };
}

function getGridMetrics(viewport, grid) {
  const horizontal = getAxisBounds(viewport.clientWidth, grid.offsetWidth);

  const vertical = getAxisBounds(viewport.clientHeight, grid.offsetHeight);

  return {
    bounds: {
      minX: horizontal.min,
      maxX: horizontal.max,
      minY: vertical.min,
      maxY: vertical.max,
    },
    center: {
      x: horizontal.center,
      y: vertical.center,
    },
  };
}

export default function useDraggableGallery({
  viewportRef,
  gridRef,
  artworksKey,
}) {
  const draggedRef = useRef(false);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const grid = gridRef.current;

      if (!viewport || !grid) {
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const cards = gsap.utils.toArray("[data-artwork-card]", grid);

      const { bounds, center } = getGridMetrics(viewport, grid);

      gsap.set(grid, {
        x: center.x,
        y: center.y,
        scale: 1,
      });

      draggedRef.current = false;

      let releaseTimer;

      const draggable = Draggable.create(grid, {
        type: "x,y",
        bounds,
        inertia: !reducedMotion,
        edgeResistance: 0.88,
        dragClickables: true,
        minimumMovement: 6,
        cursor: "grab",
        activeCursor: "grabbing",
        maxDuration: 1.2,

        onPress() {
          draggedRef.current = false;
          gsap.killTweensOf(grid, "x,y");
        },

        onDragStart() {
          draggedRef.current = true;
        },

        onRelease() {
          window.clearTimeout(releaseTimer);

          releaseTimer = window.setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        },
      })[0];

      let observer;

      if (reducedMotion) {
        gsap.set(cards, {
          autoAlpha: 1,
          scale: 1,
        });
      } else {
        gsap.fromTo(
          grid,
          { scale: 0.88 },
          {
            scale: 1,
            duration: 1.1,
            ease: "power3.inOut",
          },
        );

        gsap.set(cards, {
          autoAlpha: 0.15,
          scale: 0.82,
        });

        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              gsap.to(entry.target, {
                autoAlpha: entry.isIntersecting ? 1 : 0.15,
                scale: entry.isIntersecting ? 1 : 0.82,
                duration: 0.55,
                delay: entry.isIntersecting ? gsap.utils.random(0, 0.25) : 0,
                ease: "power2.out",
                overwrite: true,
              });
            }
          },
          {
            root: viewport,
            rootMargin: "8%",
            threshold: 0.01,
          },
        );

        for (const card of cards) {
          observer.observe(card);
        }
      }

      function handleWheel(event) {
        if (event.ctrlKey) {
          return;
        }

        event.preventDefault();
        gsap.killTweensOf(grid, "x,y");

        const unit = event.deltaMode === 1 ? 16 : 1;
        const currentX = Number(gsap.getProperty(grid, "x"));
        const currentY = Number(gsap.getProperty(grid, "y"));

        const nextX = gsap.utils.clamp(
          draggable.minX,
          draggable.maxX,
          currentX - event.deltaX * unit,
        );

        const nextY = gsap.utils.clamp(
          draggable.minY,
          draggable.maxY,
          currentY - event.deltaY * unit,
        );

        gsap.to(grid, {
          x: nextX,
          y: nextY,
          duration: reducedMotion ? 0 : 0.45,
          ease: "power3.out",
          overwrite: "auto",
          onUpdate: () => draggable.update(),
        });
      }

      function updateBounds() {
        const metrics = getGridMetrics(viewport, grid);

        draggable.applyBounds(metrics.bounds);
        draggable.update(true);
      }

      const resizeObserver = new ResizeObserver(updateBounds);

      resizeObserver.observe(viewport);
      resizeObserver.observe(grid);

      viewport.addEventListener("wheel", handleWheel, {
        passive: false,
      });

      return () => {
        draggedRef.current = false;
        window.clearTimeout(releaseTimer);
        viewport.removeEventListener("wheel", handleWheel);
        resizeObserver.disconnect();
        observer?.disconnect();
        draggable.kill();
        gsap.killTweensOf([grid, ...cards]);
      };
    },
    {
      scope: viewportRef,
      dependencies: [artworksKey],
      revertOnUpdate: true,
    },
  );

  return draggedRef;
}
