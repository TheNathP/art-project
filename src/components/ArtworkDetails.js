export default function ArtworkDetails({
  artwork,
  overlayRef,
  surfaceRef,
  backdropRef,
  imageSlotRef,
  contentRef,
  onClose,
}) {
  const isOpen = Boolean(artwork);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden={!isOpen}
      onKeyDown={handleKeyDown}
      className="pointer-events-none invisible fixed inset-0 z-[200] opacity-0"
    >
      <button
        ref={backdropRef}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-black"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-detail-title"
        className="absolute right-0 top-0 h-full w-full overflow-visible text-neutral-950 md:w-[min(52rem,55vw)]"
      >
        <div
          ref={surfaceRef}
          className="absolute inset-0 bg-stone-50 will-change-[clip-path]"
        />

        <div className="relative z-10 grid h-full grid-cols-1 content-center gap-7 overflow-y-auto px-8 pb-8 pt-20 md:grid-cols-[minmax(15rem,0.9fr)_minmax(17rem,1fr)] md:items-center md:gap-[clamp(2rem,5vw,5rem)] md:overflow-visible md:px-[clamp(2rem,5vw,5rem)] md:py-[clamp(5rem,7vw,7rem)]">
          <button
            data-details-close
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={onClose}
            className="absolute right-6 top-6 cursor-pointer border-0 bg-transparent p-2 text-xs uppercase tracking-[0.15em] outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 md:right-8 md:top-8"
          >
            Fermer
            <span aria-hidden="true"> ×</span>
          </button>

          <div
            ref={imageSlotRef}
            data-details-image-slot
            className="relative z-20 aspect-[4/5] w-[min(68vw,19rem)] md:w-full"
          />

          <div ref={contentRef} className="relative z-20">
            {artwork && (
              <>
                <p
                  data-detail-text
                  className="mb-4 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500"
                >
                  Œuvre sélectionnée
                </p>

                <h2
                  data-detail-text
                  id="artwork-detail-title"
                  className="max-w-[10ch] text-[clamp(2.3rem,12vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.055em] md:text-[clamp(2.5rem,5vw,5.5rem)]"
                >
                  {artwork.title}
                </h2>

                <dl className="mt-7 grid grid-cols-2 gap-5 md:mt-[clamp(2rem,5vw,4rem)] md:grid-cols-1">
                  <div
                    data-detail-text
                    className="border-t border-neutral-300 pt-3"
                  >
                    <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                      Date
                    </dt>

                    <dd className="mt-1 text-base">
                      {artwork.year ?? "Date inconnue"}
                    </dd>
                  </div>

                  <div
                    data-detail-text
                    className="border-t border-neutral-300 pt-3"
                  >
                    <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                      Artiste
                    </dt>

                    <dd className="mt-1 text-base">
                      {artwork.artist ?? "Artiste inconnu"}
                    </dd>
                  </div>
                </dl>

                <button
                  data-detail-text
                  type="button"
                  tabIndex={isOpen ? 0 : -1}
                  className="mt-8 cursor-pointer border border-neutral-950 bg-transparent px-5 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-neutral-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 motion-reduce:transition-none"
                >
                  En savoir plus
                  <span aria-hidden="true"> ↗</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
