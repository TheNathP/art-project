import Image from "next/image";
import TransitionLink from "./transitions/TransitionLink";

export default function FavoriteGallery({ artworks }) {
  if (artworks.length === 0) {
    return (
      <div className="relative flex min-h-80 items-center justify-center rounded-xs border border-black bg-white px-6 text-center after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black sm:min-h-96">
        <div className="relative z-10 max-w-md">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
            No favorites yet
          </span>
          <p className="mt-4 text-2xl tracking-[-0.03em] sm:text-3xl">
            Your collection is still empty.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/55">
            Browse the gallery and add the artworks you would like to revisit
            here.
          </p>
          <TransitionLink
            href="/gallery"
            className="group relative mt-7 inline-flex w-fit items-center gap-8 rounded-xs border border-black bg-white px-5 py-4 text-xs uppercase tracking-[0.12em] transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm"
          >
            Explore the gallery
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            >
              →
            </span>
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artworks.map((artwork, index) => (
        <TransitionLink
          key={artwork.slug}
          href={`/gallery/${encodeURIComponent(artwork.slug)}`}
          className="group relative rounded-xs border border-black bg-white p-3 transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:z-20 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm sm:p-4"
        >
          <span className="relative z-10 block aspect-[4/5] overflow-hidden rounded-xs border border-black bg-neutral-300">
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              priority={index < 4}
              placeholder={artwork.blurDataURL ? "blur" : "empty"}
              blurDataURL={artwork.blurDataURL}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
            />
          </span>
          <span className="relative z-10 mt-4 flex items-start justify-between gap-5 px-1 pb-1">
            <span>
              <span className="block text-lg font-medium leading-tight">
                {artwork.title}
              </span>
              <span className="mt-1 block text-xs text-black/55">
                {artwork.artist ?? "Unknown artist"}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-lg transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
            >
              ↗
            </span>
          </span>
        </TransitionLink>
      ))}
    </div>
  );
}
