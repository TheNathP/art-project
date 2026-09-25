"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useArtworkPageTransition } from "./transitions/ArtworkPageTransitionProvider";
import ArtworkTransitionLink from "./transitions/ArtworkTransitionLink";

export default function ArtworkDetails({
  artwork,
  overlayRef,
  surfaceRef,
  backdropRef,
  imageSlotRef,
  contentRef,
  onClose,
}) {
  const artworkPageTransition = useArtworkPageTransition();
  const isOpen = Boolean(artwork);
  const imageAspectRatio =
    artwork?.imageWidth && artwork?.imageHeight
      ? `${artwork.imageWidth} / ${artwork.imageHeight}`
      : "4 / 5";
  const isLandscape = artwork?.imageWidth > artwork?.imageHeight;

  useEffect(() => {
    if (!artwork?.image || !artwork?.slug) {
      return;
    }

    artworkPageTransition?.preloadArtworkTransition({
      artwork,
      href: `/gallery/${encodeURIComponent(artwork.slug)}`,
    });
  }, [artwork, artworkPageTransition]);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      data-artwork-details-overlay
      aria-hidden={!isOpen}
      onKeyDown={handleKeyDown}
      className="pointer-events-none invisible fixed inset-0 z-200 overflow-hidden opacity-0"
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
        className="absolute right-0 top-0 h-full w-full overflow-visible text-neutral-950 md:w-[min(48rem,55vw)]"
      >
        <div
          ref={surfaceRef}
          className="absolute inset-0 z-0 bg-stone-50 will-change-transform"
        />

        <button
          data-detail-text
          data-details-close
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={onClose}
          className="absolute right-5 top-5 z-40 w-fit cursor-pointer rounded-full border border-black/15 bg-stone-50/90 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-950 shadow-sm backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 md:right-7 md:top-7"
        >
          Close
          <span aria-hidden="true"> ×</span>
        </button>

        <div
          data-details-scroll
          className="relative z-10 h-full overflow-y-auto overscroll-contain"
        >
          <div
            data-artwork-detail-visual
            className="relative isolate flex h-[clamp(24rem,58svh,34rem)] w-full shrink-0 items-center justify-center px-8 py-16 md:px-[clamp(2rem,5vw,4rem)] md:py-20"
          >
            {artwork && (
              <div
                data-detail-visual-background
                aria-hidden="true"
                className="absolute inset-0 z-0 overflow-hidden bg-neutral-900 will-change-[transform,opacity]"
              >
                <Image
                  src={artwork.image}
                  alt=""
                  fill
                  placeholder={artwork.blurDataURL ? "blur" : "empty"}
                  blurDataURL={artwork.blurDataURL}
                  sizes="(max-width: 767px) 100vw, 55vw"
                  className="scale-110 object-cover blur-3xl saturate-75"
                />

                <div className="absolute inset-0 bg-black/25" />
              </div>
            )}

            <div
              ref={imageSlotRef}
              data-details-image-slot
              className={`relative z-20 shrink-0 ${
                isLandscape
                  ? "w-[min(78vw,28rem)] md:w-[min(72%,32rem)]"
                  : "w-[min(65vw,18rem)] md:w-[min(58%,20rem)]"
              }`}
              style={{ aspectRatio: imageAspectRatio }}
            />
          </div>

          <div
            ref={contentRef}
            className="relative z-20 px-8 pb-12 pt-10 md:px-[clamp(2.5rem,6vw,5rem)] md:pb-16 md:pt-12"
          >
            {artwork && (
              <>
                <p
                  data-detail-text
                  className="mb-3 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500"
                >
                  Selected artwork
                </p>

                <h2
                  data-detail-text
                  id="artwork-detail-title"
                  className="max-w-[14ch] break-words text-[clamp(2.3rem,11vw,4.5rem)] font-medium leading-[0.94] tracking-[-0.05em] md:text-[clamp(2.7rem,5vw,5rem)]"
                >
                  {artwork.title}
                </h2>

                <dl className="mt-9 flex flex-col md:mt-12">
                  <div
                    data-detail-text
                    className="border-t border-neutral-300 py-4"
                  >
                    <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                      Date
                    </dt>

                    <dd className="mt-1 text-base">
                      {artwork.year ?? "Unknown date"}
                    </dd>
                  </div>

                  <div
                    data-detail-text
                    className="border-t border-neutral-300 py-4"
                  >
                    <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                      Artist
                    </dt>

                    <dd className="mt-1 text-base">
                      {artwork.artist ?? "Unknown artist"}
                    </dd>
                  </div>
                </dl>

                <ArtworkTransitionLink
                  artwork={artwork}
                  data-detail-text
                  href={`/gallery/${encodeURIComponent(artwork.slug)}`}
                  tabIndex={isOpen ? 0 : -1}
                  className="mt-5 inline-flex w-fit cursor-pointer items-center justify-between gap-8 border border-neutral-950 bg-transparent px-5 py-4 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-neutral-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 motion-reduce:transition-none"
                >
                  Learn more
                  <span aria-hidden="true"> ↗</span>
                </ArtworkTransitionLink>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
