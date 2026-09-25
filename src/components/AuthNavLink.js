"use client";

import { useSession } from "@/lib/auth-client";
import TransitionLink from "./transitions/TransitionLink";

export default function AuthNavLink({
  onNavigate,
  className,
  style,
  ...props
}) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <span {...props} className={className} style={style}>
        Account
      </span>
    );
  }

  return (
    <TransitionLink
      href={session ? "/account" : "/login"}
      onNavigate={onNavigate}
      {...props}
      className={className}
      style={style}
    >
      {session ? "Account" : "Sign in"}
    </TransitionLink>
  );
}
