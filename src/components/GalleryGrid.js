"use client";

import { useMemo, useRef } from "react";
import useArtworkDetails from "@/app/hooks/useArtworkDetails";
import useArtworkParallax from "@/app/hooks/useArtworkParallax";
import useDraggableGallery from "@/app/hooks/useDraggableGallery";
import useGalleryFilterTransition from "@/app/hooks/useGalleryFilterTransition";
import useSiteStore from "@/app/store/useSiteStore";
import ArtworkCard from "./ArtworkCard";
import ArtworkDetails from "./ArtworkDetails";

const ARTWORKS_PER_COLUMN = 3;

function createColumns(artworks) {
  const columns = [];

  for (let index = 0; index < artworks.length; index += ARTWORKS_PER_COLUMN) {
    columns.push(artworks.slice(index, index + ARTWORKS_PER_COLUMN));
  }

  return columns;
}

export default function GalleryGrid({
  artworks,
  searchQuery,
  viewMode,
  isViewTransitioning,
  onReset,
}) {
  const sceneRef = useRef(null);
  const gridRef = useRef(null);
  const overlayRef = useRef(null);
  const surfaceRef = useRef(null);
  const backdropRef = useRef(null);
  const detailImageSlotRef = useRef(null);
  const detailContentRef = useRef(null);
  const isFirstRender = useSiteStore((state) => state.isFirstRender);

  const isGridView = viewMode === "grid";
  const { renderedArtworks, renderedSearchQuery, isFiltering } =
    useGalleryFilterTransition({
      artworks,
      searchQuery,
      gridRef,
      viewportRef: sceneRef,
    });
  const columns = useMemo(
    () => createColumns(renderedArtworks),
    [renderedArtworks],
  );

  /*
   * This key rebuilds the GSAP bounds whenever a filter changes,
   * even if the number of artworks remains the same.
   */
  const artworksKey = renderedArtworks.map((artwork) => artwork.id).join("|");

  const draggedRef = useDraggableGallery({
    viewportRef: sceneRef,
    gridRef,
    artworksKey,
    enabled: !isGridView,
    suspendCardEffects: isViewTransitioning || isFirstRender,
    filterTransitioning: isFiltering,
  });

  const { selectedArtwork, openArtwork, closeArtwork } = useArtworkDetails({
    overlayRef,
    surfaceRef,
    backdropRef,
    imageSlotRef: detailImageSlotRef,
    contentRef: detailContentRef,
  });

  useArtworkParallax({
    viewportRef: sceneRef,
    gridRef,
    artworksKey,
    enabled:
      !isGridView && !isViewTransitioning && !isFiltering && !selectedArtwork,
    maxOffset: 10,
    maxScale: 1.04,
    influenceRadius: 320,
    followDuration: 0.65,
  });

  function handleArtworkSelection(artwork, sourceElement) {
    /*
     * Prevents the details panel from opening when the user
     * only intended to drag the grid.
     */
    if (draggedRef.current) {
      return;
    }

    openArtwork(artwork, sourceElement);
  }

  return (
    <>
      {renderedArtworks.length === 0 ? (
        <div className="border-y border-neutral-300 py-16 text-center">
          <p className="text-lg">No artworks match these filters.</p>

          <button
            type="button"
            onClick={onReset}
            className="mt-4 w-fit cursor-pointer border-0 bg-transparent text-sm underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <section
          ref={sceneRef}
          aria-label={
            isGridView
              ? "Grid gallery. Scroll through the collection to explore it."
              : "Interactive gallery. Drag the collection to explore it."
          }
          className="relative isolate z-0 h-full w-full overflow-hidden overscroll-none bg-white"
        >
          {!isGridView && (
            <p
              data-gallery-intro-ui
              className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500"
            >
              Drag to explore · Click to discover
            </p>
          )}

          <div
            ref={gridRef}
            data-gallery-grid
            data-gallery-view={viewMode}
            className={
              isGridView
                ? "grid h-full w-full auto-rows-max grid-cols-1 gap-x-8 gap-y-14 overflow-y-auto overscroll-contain px-5 pb-40 pt-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                : "absolute left-0 top-0 flex w-max cursor-grab touch-none select-none gap-[clamp(3.5rem,8vw,9rem)] p-[clamp(4rem,7vw,7rem)] will-change-transform active:cursor-grabbing max-md:px-8"
            }
          >
            {columns.map((column, columnIndex) => (
              <div
                key={`column-${column[0].id}`}
                className={
                  isGridView
                    ? "contents"
                    : `flex flex-col gap-[clamp(3.5rem,7vw,8rem)] ${
                        columnIndex % 2 !== 0
                          ? "pt-[clamp(4rem,10vw,9rem)] max-md:pt-20"
                          : ""
                      }`
                }
              >
                {column.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    searchQuery={renderedSearchQuery}
                    viewMode={viewMode}
                    preloadImage={isFirstRender}
                    onSelect={handleArtworkSelection}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <ArtworkDetails
        artwork={selectedArtwork}
        overlayRef={overlayRef}
        surfaceRef={surfaceRef}
        backdropRef={backdropRef}
        imageSlotRef={detailImageSlotRef}
        contentRef={detailContentRef}
        onClose={closeArtwork}
      />
    </>
  );
}
