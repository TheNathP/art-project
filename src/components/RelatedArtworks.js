"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import RelatedArtworkPreviewAnimation from "@/app/animations/RelatedArtworkPreviewAnimation";
import TransitionLink from "@/components/transitions/TransitionLink";

function getAspectRatio(artwork) {
  const width = Number(artwork.imageWidth);
  const height = Number(artwork.imageHeight);

  return width > 0 && height > 0 ? `${width} / ${height}` : "4 / 5";
}

export default function RelatedArtworks({ artworks }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const animation = new RelatedArtworkPreviewAnimation({
      root: rootRef.current,
    });

    animation.mount();

    return () => {
      animation.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="mt-5 flex flex-col">
      {artworks.map((artwork, index) => {
        const previewId = String(index);

        return (
          <TransitionLink
            key={artwork.id ?? artwork.slug}
            href={`/gallery/${encodeURIComponent(artwork.slug)}`}
            data-related-artwork-link
            data-preview-id={previewId}
            className="group grid grid-cols-[1fr_auto] gap-6 border-t border-neutral-200 py-4 first:border-t-0"
          >
            <span>
              <span className="block text-base transition-colors group-hover:text-neutral-500">
                {artwork.title}
              </span>
              <span className="mt-1 block text-xs text-neutral-500">
                {artwork.artist}
              </span>
            </span>
            <span className="text-sm text-neutral-500">{artwork.year}</span>
          </TransitionLink>
        );
      })}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-100 hidden lg:block"
      >
        {artworks.map((artwork, index) => {
          const isLandscape = artwork.imageWidth > artwork.imageHeight;

          return (
            <div
              key={artwork.id ?? artwork.slug}
              data-related-artwork-preview
              data-preview-id={String(index)}
              className={`absolute left-0 top-0 border border-black bg-white p-1 will-change-transform ${
                isLandscape
                  ? "w-[clamp(13rem,18vw,19rem)]"
                  : "w-[clamp(10rem,13vw,14rem)]"
              }`}
              style={{ aspectRatio: getAspectRatio(artwork) }}
            >
              <div className="relative h-full w-full overflow-hidden bg-neutral-900">
                <Image
                  src={artwork.image}
                  alt=""
                  fill
                  loading="eager"
                  placeholder={artwork.blurDataURL ? "blur" : "empty"}
                  blurDataURL={artwork.blurDataURL}
                  sizes="20vw"
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
