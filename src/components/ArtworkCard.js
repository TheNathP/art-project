import Image from "next/image";
import HighlightedText from "./HighlightedText";

export default function ArtworkCard({
  artwork,
  searchQuery,
  viewMode,
  preloadImage = false,
  onSelect,
}) {
  const imageWidth = artwork.imageWidth ?? 4;
  const imageHeight = artwork.imageHeight ?? 5;
  const imageAspectRatio = `${imageWidth} / ${imageHeight}`;
  const isWiderThanCard = imageWidth / imageHeight >= 4 / 5;

  function handleClick(event) {
    const sourceElement = event.currentTarget.querySelector(
      "[data-artwork-visual]",
    );

    onSelect(artwork, sourceElement);
  }

  return (
    <article
      data-artwork-card
      data-artwork-id={artwork.id}
      data-artwork-slug={artwork.slug}
      data-flip-id={`artwork-${artwork.id}`}
      className={`will-change-[transform,opacity] ${
        viewMode === "grid" ? "w-full" : "w-[clamp(11rem,20vw,18rem)]"
      }`}
    >
      <button
        type="button"
        aria-label={`View details for ${artwork.title}`}
        onClick={handleClick}
        className={`group relative isolate block w-full border-0 bg-transparent p-0 text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-8 ${
          viewMode === "grid"
            ? "cursor-pointer"
            : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <span
          data-artwork-slot
          className="relative z-10 block aspect-[4/5] w-full"
        >
          <span
            data-artwork-visual
            className="absolute inset-0 block overflow-hidden bg-neutral-300 shadow-2xl will-change-transform rounded-xs"
          >
            <span
              data-artwork-image-wrapper
              className={`absolute left-1/2 top-1/2 block max-w-none -translate-x-1/2 -translate-y-1/2 ${
                isWiderThanCard ? "h-full w-auto" : "h-auto w-full"
              }`}
              style={{ aspectRatio: imageAspectRatio }}
            >
              <span
                data-artwork-parallax
                className="absolute inset-0 block will-change-transform"
              >
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  draggable={false}
                  loading={preloadImage ? "eager" : "lazy"}
                  placeholder={artwork.blurDataURL ? "blur" : "empty"}
                  blurDataURL={artwork.blurDataURL}
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 32vw"
                  className="pointer-events-none object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] group-focus-visible:scale-[1.045] motion-reduce:transition-none"
                />
              </span>
            </span>
          </span>
        </span>

        <span
          data-artwork-meta
          className="relative z-0 mt-3 flex flex-col gap-1 will-change-transform"
        >
          <span className="truncate text-[clamp(1rem,1.5vw,1.3rem)] font-medium leading-tight">
            <HighlightedText text={artwork.title} query={searchQuery} />
          </span>

          <span className="text-xs text-neutral-600">
            <HighlightedText
              text={artwork.artist ?? "Unknown artist"}
              query={searchQuery}
            />
          </span>
        </span>
      </button>
    </article>
  );
}
