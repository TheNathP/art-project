"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import GalleryPreloaderAnimation from "@/app/animations/GalleryPreloaderAnimation";
import SitePreloaderAnimation from "@/app/animations/SitePreloaderAnimation";
import {
  SITE_EXIT_FRAME_CLASSNAME,
  SITE_FRAME_CLASSNAME,
} from "@/app/lib/preloader-layout";
import useSiteStore from "@/app/store/useSiteStore";

export default function SitePreloader({ artworks, enabled = true }) {
  const pathname = usePathname();
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const solidFrameRef = useRef(null);
  const targetFrameRef = useRef(null);
  const mediaRef = useRef(null);
  const counterRef = useRef(null);
  const isFirstRender = useSiteStore((state) => state.isFirstRender);
  const hasHydrated = useSiteStore((state) => state.hasHydrated);
  const completeFirstRender = useSiteStore(
    (state) => state.completeFirstRender,
  );
  const completeHydration = useSiteStore((state) => state.completeHydration);
  const shouldPlay = enabled && hasHydrated && isFirstRender;
  const targetFrameClassName =
    pathname === "/" ? SITE_FRAME_CLASSNAME : SITE_EXIT_FRAME_CLASSNAME;

  useLayoutEffect(() => {
    if (hasHydrated) {
      return;
    }

    let isMounted = true;
    const finishHydration = () => {
      if (isMounted) {
        completeHydration();
      }
    };

    Promise.resolve(useSiteStore.persist.rehydrate()).then(
      finishHydration,
      finishHydration,
    );

    return () => {
      isMounted = false;
    };
  }, [completeHydration, hasHydrated]);

  useLayoutEffect(() => {
    if (!shouldPlay) {
      return;
    }

    const root = rootRef.current;
    const frame = frameRef.current;
    const solidFrame = solidFrameRef.current;
    const targetFrame = targetFrameRef.current;
    const media = mediaRef.current;
    const counter = counterRef.current;

    if (!root || !frame || !solidFrame || !targetFrame || !media || !counter) {
      completeFirstRender();
      return;
    }

    const PreloaderAnimation =
      pathname === "/gallery"
        ? GalleryPreloaderAnimation
        : SitePreloaderAnimation;
    const animation = new PreloaderAnimation({
      root,
      frame,
      solidFrame,
      targetFrame,
      media,
      counter,
      drawnLines: Array.from(frame.querySelectorAll("[data-preloader-line]")),
      imageWrappers: Array.from(
        frame.querySelectorAll("[data-preloader-image]"),
      ),
    });

    animation.play({ onComplete: completeFirstRender });

    return () => animation.destroy();
  }, [completeFirstRender, pathname, shouldPlay]);

  if (!hasHydrated || !shouldPlay) {
    return null;
  }

  return (
    <div ref={rootRef} className="fixed inset-0 z-5000 bg-white">
      <div
        ref={targetFrameRef}
        aria-hidden="true"
        className={`pointer-events-none invisible ${targetFrameClassName}`}
      />

      <output className="sr-only" aria-live="polite">
        Loading the gallery
      </output>

      <div
        ref={frameRef}
        data-preloader-frame
        aria-hidden="true"
        className="fixed left-1/2 top-1/2 h-[clamp(11rem,27vw,19rem)] w-[min(72vw,34rem)] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          ref={solidFrameRef}
          data-preloader-solid
          className="absolute inset-0 border-2 border-black opacity-0"
        />

        <span
          data-preloader-line="vertical"
          className="absolute left-0 top-0 z-10 h-full w-0.5 bg-black will-change-transform"
        />
        <span
          data-preloader-line="vertical"
          className="absolute right-0 top-0 z-10 h-full w-0.5 bg-black will-change-transform"
        />
        <span
          data-preloader-line="horizontal"
          className="absolute left-0 top-0 z-10 h-0.5 w-full bg-black will-change-transform"
        />
        <span
          data-preloader-line="horizontal"
          className="absolute bottom-0 left-0 z-10 h-0.5 w-full bg-black will-change-transform"
        />

        <div
          ref={mediaRef}
          className="absolute inset-4 overflow-hidden bg-neutral-200 sm:inset-5"
        >
          {artworks.map((artwork, index) => (
            <div
              key={artwork.slug}
              data-preloader-image
              data-preloader-artwork={artwork.slug}
              className="absolute inset-0 overflow-hidden will-change-[clip-path]"
              style={{ zIndex: artworks.length - index }}
            >
              <Image
                src={artwork.image}
                alt=""
                fill
                unoptimized
                preload={index === 0}
                loading={index === 0 ? undefined : "eager"}
                placeholder={artwork.blurDataURL ? "blur" : "empty"}
                blurDataURL={artwork.blurDataURL}
                sizes="(max-width: 768px) 72vw, 544px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <p
        ref={counterRef}
        aria-hidden="true"
        className="fixed left-1/2 -translate-x-1/2 font-mono text-sm tabular-nums text-black"
        style={{ top: "calc(50% + clamp(7.5rem, 17vw, 11.5rem))" }}
      >
        0
      </p>
    </div>
  );
}
