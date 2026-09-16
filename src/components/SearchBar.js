"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
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
   * Synchronise l'input lors d'un retour navigateur,
   * d'une réinitialisation ou d'une modification externe de l'URL.
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
   * Évite de provoquer une navigation Next.js à chaque frappe.
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
    <div className="min-w-0 border-b border-black/20 px-3 py-2 sm:border-b-0 sm:border-r">
      <label
        htmlFor="gallery-search"
        className="block text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500"
      >
        Recherche
      </label>

      <div className="mt-0.5 flex items-center gap-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 shrink-0 text-neutral-500"
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
          placeholder="Titre ou artiste"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium outline-none placeholder:font-normal placeholder:text-neutral-400 focus-visible:ring-0"
        />

        {value && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={clearSearch}
            className="shrink-0 cursor-pointer border-0 bg-transparent text-lg leading-none text-neutral-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}