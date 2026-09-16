import Image from "next/image";
import HighlightedText from "./HighlightedText";

export default function ArtworkCard({ artwork, searchQuery, onSelect }) {
  function handleClick(event) {
    const sourceElement = event.currentTarget.querySelector(
      "[data-artwork-visual]",
    );

    onSelect(artwork, sourceElement);
  }

  return (
    <article
      data-artwork-card
      className="w-[clamp(11rem,20vw,18rem)] will-change-[transform,opacity]"
    >
      <button
        type="button"
        aria-label={`Voir les détails de ${artwork.title}`}
        onClick={handleClick}
        className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-8"
      >
        <span data-artwork-slot className="relative block aspect-[4/5] w-full">
          <span
            data-artwork-visual
            className="absolute inset-0 block overflow-hidden bg-neutral-300 will-change-transform"
          >
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              draggable={false}
              sizes="(max-width: 640px) 55vw, (max-width: 1024px) 32vw, 20vw"
              className="pointer-events-none object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] group-focus-visible:scale-[1.045] motion-reduce:transition-none"
            />
          </span>
        </span>

        <span className="mt-3 flex flex-col gap-1">
          <span className="truncate text-[clamp(1rem,1.5vw,1.3rem)] font-medium leading-tight">
            <HighlightedText
              text={artwork.title}
              query={searchQuery}
            />
          </span>

          <span className="text-xs text-neutral-600">
              <HighlightedText
                text={artwork.artist ?? "Artiste inconnu"}
                query={searchQuery}
              />
          </span>
        </span>

        <span className="mt-1 block text-xs text-neutral-500">
          {artwork.year ?? "Date inconnue"}
        </span>
      </button>
    </article>
  );
}
