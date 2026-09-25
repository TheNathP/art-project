"use client";

import Link from "next/link";
import { DEFAULT_TRANSITION_TYPE } from "@/app/lib/page-view-transition";
import { usePageTransition } from "./PageTransitionProvider";

export default function TransitionLink({
  href,
  replace = false,
  scroll = true,
  transitionType = DEFAULT_TRANSITION_TYPE,
  onNavigate,
  ...props
}) {
  const navigate = usePageTransition();

  function handleNavigate(event) {
    onNavigate?.(event);

    if (event.defaultPrevented || !navigate || !transitionType) {
      return;
    }

    event.preventDefault();
    navigate({
      href,
      replace,
      scroll,
      type: transitionType,
    });
  }

  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={scroll}
      onNavigate={handleNavigate}
    />
  );
}
