"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import useGalleryViewTransition from "@/app/hooks/useGalleryViewTransition";
import GalleryFilters from "./GalleryFilters";
import GalleryGrid from "./GalleryGrid";

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export default function GalleryCollection({ artworks }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const galleryRootRef = useRef(null);

  const { viewMode, isTransitioning, changeViewMode } =
    useGalleryViewTransition({
      rootRef: galleryRootRef,
    });

  const years = [
    ...new Set(
      artworks
        .map((artwork) => artwork.year)
        .filter((year) => year !== null && year !== undefined),
    ),
  ].sort((a, b) => b - a);

  const movements = [
    ...new Set(artworks.map((artwork) => artwork.movement).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "fr"));

  const yearParam = searchParams.get("year");
  const movementParam = searchParams.get("movement");
  const searchQuery = searchParams.get("search")?.trim() ?? "";

  const normalizedSearchQuery = normalizeSearchValue(searchQuery);

  const selectedYear = years.some((year) => String(year) === yearParam)
    ? yearParam
    : "all";

  const selectedMovement = movements.includes(movementParam)
    ? movementParam
    : "all";

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesYear =
      selectedYear === "all" || String(artwork.year) === selectedYear;

    const matchesMovement =
      selectedMovement === "all" || artwork.movement === selectedMovement;

    const matchesSearch =
      normalizedSearchQuery === "" ||
      [artwork.title, artwork.artist].some((value) =>
        normalizeSearchValue(value).includes(normalizedSearchQuery),
      );

    return matchesYear && matchesMovement && matchesSearch;
  });

  function replaceSearchParams(params) {
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.replace(url, {
      scroll: false,
    });
  }

  function updateFilter(name, value) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    replaceSearchParams(params);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("year");
    params.delete("movement");
    params.delete("search");

    replaceSearchParams(params);
  }

  useEffect(() => {
    const root = galleryRootRef.current;

    if (!root) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      root.dataset.galleryHydrated = "true";
    });

    return () => {
      window.cancelAnimationFrame(frame);
      delete root.dataset.galleryHydrated;
    };
  }, []);

  return (
    <div ref={galleryRootRef} data-gallery-root className="h-full w-full">
      <GalleryFilters
        years={years}
        movements={movements}
        selectedYear={selectedYear}
        selectedMovement={selectedMovement}
        searchQuery={searchQuery}
        viewMode={viewMode}
        isViewTransitioning={isTransitioning}
        onYearChange={(value) => updateFilter("year", value)}
        onMovementChange={(value) => updateFilter("movement", value)}
        onViewModeChange={changeViewMode}
        onReset={resetFilters}
      />

      <GalleryGrid
        artworks={filteredArtworks}
        searchQuery={searchQuery}
        viewMode={viewMode}
        isViewTransitioning={isTransitioning}
        onReset={resetFilters}
      />
    </div>
  );
}
