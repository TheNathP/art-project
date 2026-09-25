"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import AuthPageTransition from "@/app/animations/AuthPageTransition";

const AuthTransitionContext = createContext(null);
const AUTH_PATHS = new Set(["/login", "/register"]);

export function useAuthTransition() {
  return useContext(AuthTransitionContext);
}

export default function AuthTransitionShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const frameRef = useRef(null);
  const gridRef = useRef(null);
  const animationRef = useRef(null);
  const pendingPathnameRef = useRef(null);
  const isTransitioningRef = useRef(false);

  useLayoutEffect(() => {
    const animation = new AuthPageTransition({
      frame: frameRef.current,
      grid: gridRef.current,
    });

    animation.mount();
    animationRef.current = animation;

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingPathnameRef.current !== pathname) {
      return;
    }

    pendingPathnameRef.current = null;

    animationRef.current?.playEntry().finally(() => {
      isTransitioningRef.current = false;
    });
  }, [pathname]);

  const navigate = useCallback(
    ({ href, replace = false }) => {
      const destination = new URL(href, window.location.href);
      const isAuthSwap =
        destination.origin === window.location.origin &&
        AUTH_PATHS.has(pathname) &&
        AUTH_PATHS.has(destination.pathname) &&
        destination.pathname !== pathname;

      if (!isAuthSwap) {
        return false;
      }

      if (isTransitioningRef.current) {
        return true;
      }

      const animation = animationRef.current;
      const navigateWithRouter = () => {
        const method = replace ? router.replace : router.push;
        method(href, { scroll: false });
      };

      if (!animation || animation.reducedMotion) {
        navigateWithRouter();
        return true;
      }

      isTransitioningRef.current = true;
      pendingPathnameRef.current = destination.pathname;

      animation
        .playExit()
        .then(() => {
          animation.lockFrame();
          navigateWithRouter();
        })
        .catch(() => {
          pendingPathnameRef.current = null;
          isTransitioningRef.current = false;
          animation.restore();
          navigateWithRouter();
        });

      return true;
    },
    [pathname, router],
  );

  const contextValue = useMemo(() => ({ navigate }), [navigate]);

  return (
    <AuthTransitionContext.Provider value={contextValue}>
      <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#c7e7ff] px-4 pb-12 pt-44 text-black sm:px-8">
        <section
          ref={frameRef}
          className="relative w-full max-w-[82rem] rounded-xs border border-black bg-white p-1"
        >
          <div
            ref={gridRef}
            className="grid min-h-[36rem] rounded-xs border border-black bg-white lg:grid-cols-[0.9fr_1.1fr]"
          >
            {children}
          </div>
        </section>
      </main>
    </AuthTransitionContext.Provider>
  );
}
