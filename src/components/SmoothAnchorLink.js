"use client";

import { useLenis } from "lenis/react";

export default function SmoothAnchorLink({ href, onClick, ...props }) {
  const lenis = useLenis();

  function handleClick(event) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      typeof href !== "string" ||
      !href.startsWith("#")
    ) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    if (lenis) {
      lenis.scrollTo(target);
    } else {
      target.scrollIntoView({ block: "start" });
    }

    window.history.pushState(null, "", href);
  }

  return <a {...props} href={href} onClick={handleClick} />;
}
