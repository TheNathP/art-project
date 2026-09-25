"use client";

import Link from "next/link";
import { useAuthTransition } from "./AuthTransitionShell";

export default function AuthTransitionLink({
  href,
  replace = false,
  onNavigate,
  ...props
}) {
  const transition = useAuthTransition();

  function handleNavigate(event) {
    onNavigate?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const hasStarted = transition?.navigate({ href, replace });

    if (hasStarted) {
      event.preventDefault();
    }
  }

  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={false}
      onNavigate={handleNavigate}
    />
  );
}
