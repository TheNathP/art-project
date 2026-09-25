"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  DEFAULT_TRANSITION_TYPE,
  startPageViewTransition,
} from "@/app/lib/page-view-transition";

const NAVIGATION_TIMEOUT = 2500;
const PageTransitionContext = createContext(null);

function formatHref(href) {
  if (typeof href === "string") {
    return href;
  }

  if (href instanceof URL) {
    return href.toString();
  }

  const pathname = href?.pathname ?? "";
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(href?.query ?? {})) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) {
        params.append(key, String(item));
      }
    }
  }

  const query = params.toString();
  const hash = href?.hash ? String(href.hash).replace(/^#?/, "#") : "";

  return `${pathname}${query ? `?${query}` : ""}${hash}`;
}

export function PageTransitionProvider({
  children,
  defaultType = DEFAULT_TRANSITION_TYPE,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingNavigationRef = useRef(null);

  useEffect(() => {
    const pendingNavigation = pendingNavigationRef.current;

    if (
      pendingNavigation &&
      pathname === pendingNavigation.destinationPathname
    ) {
      pendingNavigation.resolve();
    }
  }, [pathname]);

  useEffect(
    () => () => {
      pendingNavigationRef.current?.resolve();
    },
    [],
  );

  const navigate = useCallback(
    ({ href, replace = false, scroll = true, type = defaultType }) => {
      const formattedHref = formatHref(href);
      const destination = new URL(formattedHref, window.location.href);
      const navigateWithRouter = () => {
        const method = replace ? router.replace : router.push;
        method(formattedHref, { scroll });
      };

      if (
        destination.origin !== window.location.origin ||
        destination.pathname === pathname
      ) {
        navigateWithRouter();
        return null;
      }

      return startPageViewTransition({
        type,
        update: () =>
          new Promise((resolve) => {
            let isResolved = false;

            const finishNavigation = () => {
              if (isResolved) {
                return;
              }

              isResolved = true;
              window.clearTimeout(timeoutId);

              if (pendingNavigationRef.current?.resolve === finishNavigation) {
                pendingNavigationRef.current = null;
              }

              resolve();
            };

            const timeoutId = window.setTimeout(
              finishNavigation,
              NAVIGATION_TIMEOUT,
            );

            pendingNavigationRef.current?.resolve();
            pendingNavigationRef.current = {
              destinationPathname: destination.pathname,
              resolve: finishNavigation,
            };

            startTransition(navigateWithRouter);
          }),
      });
    },
    [defaultType, pathname, router],
  );

  return (
    <PageTransitionContext.Provider value={navigate}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(PageTransitionContext);
}
