"use client";

import { useMemo, useRef } from "react";
import useArtworkDetails from "@/app/animations/useArtworkDetails";
import useDraggableGallery from "@/app/animations/useDraggableGallery";
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

export default function GalleryGrid({ artworks, searchQuery, onReset }) {
  const sceneRef = useRef(null);
  const gridRef = useRef(null);
  const overlayRef = useRef(null);
  const surfaceRef = useRef(null);
  const backdropRef = useRef(null);
  const detailImageSlotRef = useRef(null);
  const detailContentRef = useRef(null);

  const columns = useMemo(() => createColumns(artworks), [artworks]);

  /*
   * Cette clé permet de recréer les limites GSAP lorsqu’un
   * filtre change, même si le nombre d’œuvres reste identique.
   */
  const artworksKey = artworks.map((artwork) => artwork.id).join("|");

  const draggedRef = useDraggableGallery({
    viewportRef: sceneRef,
    gridRef,
    artworksKey,
  });

  const { selectedArtwork, openArtwork, closeArtwork } = useArtworkDetails({
    overlayRef,
    surfaceRef,
    backdropRef,
    imageSlotRef: detailImageSlotRef,
    contentRef: detailContentRef,
  });

  function handleArtworkSelection(artwork, sourceElement) {
    /*
     * Empêche l’ouverture de la fiche lorsque l’utilisateur
     * voulait seulement déplacer la grille.
     */
    if (draggedRef.current) {
      return;
    }

    openArtwork(artwork, sourceElement);
  }

  return (
    <>
      {artworks.length === 0 ? (
        <div className="border-y border-neutral-300 py-16 text-center">
          <p className="text-lg">Aucune œuvre ne correspond à ces filtres.</p>

          <button
            type="button"
            onClick={onReset}
            className="mt-4 cursor-pointer border-0 bg-transparent text-sm underline underline-offset-4"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <section
          ref={sceneRef}
          aria-label="Galerie interactive. Faites glisser la collection pour l’explorer."
          className="relative isolate z-0 h-full w-full overflow-hidden overscroll-none bg-stone-100"
        >
          <p className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500">
            Glisser pour explorer · Cliquer pour découvrir
          </p>

          <div
            ref={gridRef}
            data-gallery-grid
            className="absolute left-0 top-0 flex w-max cursor-grab touch-none select-none gap-[clamp(1.25rem,4vw,4rem)] p-[clamp(4rem,7vw,7rem)] will-change-transform active:cursor-grabbing max-md:px-8"
          >
            {columns.map((column, columnIndex) => (
              <div
                key={`column-${column[0].id}`}
                className={`flex flex-col gap-[clamp(1.5rem,4vw,4rem)] ${
                  columnIndex % 2 !== 0
                    ? "pt-[clamp(4rem,10vw,9rem)] max-md:pt-20"
                    : ""
                }`}
              >
                {column.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    searchQuery={searchQuery}
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
