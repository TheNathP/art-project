"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SEARCH_DELAY = 300;

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const serializedSearchParams = searchParams.toString();
  const currentSearch = searchParams.get("search") ?? "";

  const [value, setValue] = useState(currentSearch);

  /*
   * Synchronizes the input after browser navigation,
   * a reset, or an external URL change.
   */
  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const replaceSearchParam = useCallback(
    (nextValue) => {
      const params = new URLSearchParams(serializedSearchParams);
      const normalizedValue = nextValue.trim();

      if (normalizedValue) {
        params.set("search", normalizedValue);
      } else {
        params.delete("search");
      }

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      router.replace(url, {
        scroll: false,
      });
    },
    [pathname, router, serializedSearchParams],
  );

  /*
   * Avoids triggering a Next.js navigation on every keystroke.
   */
  useEffect(() => {
    const normalizedValue = value.trim();

    if (normalizedValue === currentSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      replaceSearchParam(normalizedValue);
    }, SEARCH_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [currentSearch, replaceSearchParam, value]);

  function clearSearch() {
    setValue("");
  }

  return (
    <div
      data-gallery-filter-item
      className={`group relative h-16 w-[clamp(13rem,22vw,18rem)] px-4 py-3 text-black shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-within:rounded-md focus-within:bg-[var(--main-highlight)] focus-within:after:rounded-sm ${
        value
          ? "rounded-md bg-[var(--main-highlight)] after:rounded-sm"
          : "rounded-xs bg-white after:rounded-xs"
      }`}
    >
      <div className="relative z-10">
        <label
          htmlFor="gallery-search"
          className="block text-[0.6rem] uppercase tracking-[0.16em] text-black/55"
        >
          Search
        </label>

        <div className="mt-0.5 flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 shrink-0 text-black/60"
          >
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <input
            id="gallery-search"
            name="search"
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Title or artist"
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-black outline-none placeholder:font-normal placeholder:text-black/45 focus-visible:ring-0"
          />

          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="w-fit shrink-0 cursor-pointer border-0 bg-transparent text-lg leading-none text-black/60 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
