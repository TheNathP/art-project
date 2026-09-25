"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import MenuAnimation from "@/app/animations/MenuAnimation";
import Navlinks from "./Navlinks";

export default function Menu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const navRef = useRef(null);
  const animationRef = useRef(null);

  useLayoutEffect(() => {
    const animation = new MenuAnimation({
      root: rootRef.current,
      trigger: triggerRef.current,
      nav: navRef.current,
    });

    animation.mount();
    animationRef.current = animation;

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, []);

  const closeMenu = useCallback((options) => {
    setOpen(false);
    animationRef.current?.close(options);
  }, []);

  function toggleMenu() {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen) {
      animationRef.current?.open();
    } else {
      animationRef.current?.close();
    }
  }

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeMenu]);

  return (
    <div ref={rootRef} className="relative flex w-fit justify-end">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={toggleMenu}
        className={`group relative z-20 grid size-13 place-items-center overflow-hidden bg-[var(--main-highlight)] text-black shadow-[0_12px_35px_rgba(0,0,0,0.2)] outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${
          open ? "rounded-[100%]" : "rounded-xs"
        }`}
      >
        <span
          className={`relative grid size-13 shrink-0 place-items-center after:pointer-events-none after:absolute after:inset-1 after:border after:border-black after:transition-all after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:border-white group-focus-visible:after:border-white ${
            open ? "after:rounded-[100%]" : "after:rounded-xs"
          }`}
        >
          <span aria-hidden="true" className="relative block size-5">
            <span
              className={`absolute left-0 top-[0.35rem] block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "translate-y-[0.27rem] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-[0.35rem] left-0 block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "-translate-y-[0.27rem] -rotate-45" : ""
              }`}
            />
          </span>
        </span>
      </button>

      <nav
        ref={navRef}
        id="main-navigation"
        aria-hidden={!open}
        inert={!open}
        className={`absolute right-0 top-0 z-10 h-0 w-0 overflow-visible ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <Navlinks
          onNavigate={() => closeMenu()}
          className="invisible absolute right-0 top-0 inline-flex w-fit items-center justify-center whitespace-nowrap rounded-xs bg-white px-6 py-3 text-sm text-black opacity-0 transition-[background-color,color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-color,border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:text-black hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:after:rounded-sm"
        />
      </nav>
    </div>
  );
}
