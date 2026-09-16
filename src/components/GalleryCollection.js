"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

  const years = [
    ...new Set(
      artworks
        .map((artwork) => artwork.year)
        .filter((year) => year !== null && year !== undefined),
    ),
  ].sort((a, b) => b - a);

  const movements = [
    ...new Set(
      artworks
        .map((artwork) => artwork.movement)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"));

  const yearParam = searchParams.get("year");
  const movementParam = searchParams.get("movement");
  const searchQuery = searchParams.get("search")?.trim() ?? "";

  const normalizedSearchQuery = normalizeSearchValue(searchQuery);

  const selectedYear = years.some(
    (year) => String(year) === yearParam,
  )
    ? yearParam
    : "all";

  const selectedMovement = movements.includes(movementParam)
    ? movementParam
    : "all";

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesYear =
      selectedYear === "all" ||
      String(artwork.year) === selectedYear;

    const matchesMovement =
      selectedMovement === "all" ||
      artwork.movement === selectedMovement;

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

  return (
    <>
        <GalleryFilters
          years={years}
          movements={movements}
          selectedYear={selectedYear}
          selectedMovement={selectedMovement}
          searchQuery={searchQuery}
          resultCount={filteredArtworks.length}
          onYearChange={(value) => updateFilter("year", value)}
          onMovementChange={(value) => updateFilter("movement", value)}
          onReset={resetFilters}
        />

        <GalleryGrid
        artworks={filteredArtworks}
        searchQuery={searchQuery}
        onReset={resetFilters}
        />
    </>
    );
}