"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import GalleryFiltersAnimation from "@/app/animations/GalleryFiltersAnimation";
import CustomFilterSelect from "./CustomFilterSelect";
import GalleryViewToggle from "./GalleryViewToggle";
import SearchBar from "./SearchBar";

export default function GalleryFilters({
  years,
  movements,
  selectedYear,
  selectedMovement,
  searchQuery,
  viewMode,
  isViewTransitioning,
  onYearChange,
  onMovementChange,
  onViewModeChange,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const filtersRef = useRef(null);
  const panelRef = useRef(null);
  const animationRef = useRef(null);
  const hasActiveFilters =
    selectedYear !== "all" || selectedMovement !== "all" || searchQuery !== "";
  const yearOptions = [
    { value: "all", label: "All dates" },
    ...years.map((year) => ({ value: String(year), label: String(year) })),
  ];
  const movementOptions = [
    { value: "all", label: "All movements" },
    ...movements.map((movement) => ({ value: movement, label: movement })),
  ];

  useLayoutEffect(() => {
    const animation = new GalleryFiltersAnimation({
      root: filtersRef.current,
    });

    animation.mount();
    animationRef.current = animation;

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const root = filtersRef.current;
    const panel = panelRef.current;

    if (!root || !panel) {
      return;
    }

    const updatePanelWidth = () => {
      root.style.setProperty("--filter-panel-width", `${panel.offsetWidth}px`);
    };
    const observer = new ResizeObserver(updatePanelWidth);

    updatePanelWidth();
    observer.observe(panel);

    return () => observer.disconnect();
  }, []);

  const closeFilters = useCallback((options) => {
    setOpen(false);
    animationRef.current?.close(options);
  }, []);

  function toggleFilters() {
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
        closeFilters();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeFilters]);

  return (
    <div
      ref={filtersRef}
      data-gallery-floating-ui
      className="pointer-events-none fixed inset-x-0 bottom-5 z-1000 h-13 [--filter-panel-width:0px]"
    >
      <div
        ref={panelRef}
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-[calc(100%+0.75rem)] left-1/2 flex max-h-[calc(100svh-8rem)] -translate-x-1/2 flex-col items-center gap-3 xl:bottom-0 xl:max-h-none xl:flex-row xl:items-end ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <SearchBar />

        <CustomFilterSelect
          id="year-filter"
          label="Date"
          value={selectedYear}
          options={yearOptions}
          onChange={onYearChange}
        />

        <CustomFilterSelect
          id="movement-filter"
          label="Movement"
          value={selectedMovement}
          options={movementOptions}
          onChange={onMovementChange}
          className="w-[clamp(12rem,18vw,15rem)]"
        />

        <GalleryViewToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          disabled={isViewTransitioning}
        />

        <button
          data-gallery-filter-item
          type="button"
          aria-label="Reset filters"
          disabled={!hasActiveFilters}
          onClick={onReset}
          className={`group relative flex h-16 w-fit shrink-0 items-center justify-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.12em] text-black shadow-[0_10px_30px_rgba(0,0,0,0.14)] outline-none transition-[background-color,border-radius,opacity] duration-300 after:pointer-events-none after:absolute after:inset-1 after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:after:rounded-sm disabled:cursor-not-allowed disabled:opacity-45 ${
            hasActiveFilters
              ? "cursor-pointer rounded-md bg-[var(--main-highlight)] after:rounded-sm"
              : "rounded-xs bg-white after:rounded-xs"
          }`}
        >
          <span>Clear</span>
          <span
            aria-hidden="true"
            className="text-lg leading-none transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none"
          >
            ×
          </span>
        </button>
      </div>

      <button
        type="button"
        aria-label={open ? "Close filters" : "Open filters"}
        aria-expanded={open}
        onClick={toggleFilters}
        style={{
          transitionProperty:
            "transform, translate, background-color, color, border-radius",
          transitionDuration: open
            ? "500ms, 500ms, 500ms, 500ms, 500ms"
            : "1000ms, 1000ms, 500ms, 500ms, 500ms",
          transitionTimingFunction:
            "cubic-bezier(0.65, 0, 0.35, 1), cubic-bezier(0.65, 0, 0.35, 1), cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className={`group pointer-events-auto absolute bottom-0 left-1/2 z-20 grid size-13 place-items-center overflow-hidden bg-[var(--main-highlight)] text-black shadow-[0_12px_35px_rgba(0,0,0,0.2)] outline-none hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${
          open
            ? "-translate-x-1/2 rounded-[100%] xl:translate-x-[calc(var(--filter-panel-width)/-2_-_0.75rem_-_100%)]"
            : "-translate-x-1/2 rounded-xs"
        }`}
      >
        <span
          className={`relative grid size-13 place-items-center after:pointer-events-none after:absolute after:inset-1 after:border after:border-black after:transition-all after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:border-white group-focus-visible:after:border-white ${
            open ? "after:rounded-[100%]" : "after:rounded-xs"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
          >
            <path
              d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx="16"
              cy="6"
              r="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="8"
              cy="12"
              r="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="13"
              cy="18"
              r="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
