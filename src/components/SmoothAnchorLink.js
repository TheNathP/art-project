"use client";

export default function SmoothAnchorLink({ href, onClick, ...props }) {
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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", href);
  }

  return <a {...props} href={href} onClick={handleClick} />;
}
