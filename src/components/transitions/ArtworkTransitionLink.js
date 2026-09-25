"use client";

import Link from "next/link";
import { useRef } from "react";
import { DEFAULT_TRANSITION_TYPE } from "@/app/lib/page-view-transition";
import { useArtworkPageTransition } from "./ArtworkPageTransitionProvider";
import { usePageTransition } from "./PageTransitionProvider";

export default function ArtworkTransitionLink({
  artwork,
  children,
  href,
  onNavigate,
  ...props
}) {
  const linkRef = useRef(null);
  const artworkPageTransition = useArtworkPageTransition();
  const startArtworkTransition = artworkPageTransition?.startArtworkTransition;
  const navigateWithPageTransition = usePageTransition();

  function handleNavigate(event) {
    onNavigate?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (!startArtworkTransition) {
      if (navigateWithPageTransition) {
        event.preventDefault();
        navigateWithPageTransition({
          href,
          type: DEFAULT_TRANSITION_TYPE,
        });
      }

      return;
    }

    const sourceVisual = linkRef.current
      ?.closest("[data-artwork-details-overlay]")
      ?.querySelector("[data-artwork-detail-visual]");

    const hasStarted = startArtworkTransition({
      href,
      artwork,
      sourceVisual,
    });

    if (hasStarted) {
      event.preventDefault();
      return;
    }

    if (navigateWithPageTransition) {
      event.preventDefault();
      navigateWithPageTransition({
        href,
        type: DEFAULT_TRANSITION_TYPE,
      });
    }
  }

  return (
    <Link
      {...props}
      ref={linkRef}
      href={href}
      onNavigate={handleNavigate}
      scroll
    >
      {children}
    </Link>
  );
}
