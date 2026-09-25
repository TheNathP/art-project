"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import GalleryFilterTransition from "@/app/animations/GalleryFilterTransition";

export default function useGalleryFilterTransition({
  artworks,
  searchQuery,
  gridRef,
  viewportRef,
}) {
  const [renderedArtworks, setRenderedArtworks] = useState(artworks);
  const [renderedSearchQuery, setRenderedSearchQuery] = useState(searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const latestArtworksRef = useRef(artworks);
  const latestSearchQueryRef = useRef(searchQuery);
  const [animation] = useState(
    () =>
      new GalleryFilterTransition({
        gridRef,
        viewportRef,
        onRenderArtworks: (nextArtworks, nextSearchQuery) => {
          setRenderedArtworks(nextArtworks);
          setRenderedSearchQuery(nextSearchQuery);
        },
        onTransitionChange: setIsFiltering,
      }),
  );

  latestArtworksRef.current = artworks;
  latestSearchQueryRef.current = searchQuery;

  useLayoutEffect(() => {
    animation.mount(latestArtworksRef.current, latestSearchQueryRef.current);

    return () => animation.destroy();
  }, [animation]);

  useEffect(() => {
    animation.changeArtworks(artworks, searchQuery);
  }, [animation, artworks, searchQuery]);

  return {
    renderedArtworks,
    renderedSearchQuery,
    isFiltering,
  };
}
