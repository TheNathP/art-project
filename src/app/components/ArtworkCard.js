import Image from "next/image";
import Link from "next/link";

export default function ArtworkCard({ artwork }) {
  return (
    <Link
      href={`/gallery/${artwork.slug}`}
      prefetch={false}
      className="group block"
    >
      <article>
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
          <Image
            src={artwork.image}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium group-hover:underline">
              {artwork.title}
            </h2>

            <p className="mt-1 text-sm text-neutral-600">
              {artwork.artist}
            </p>
          </div>

          <span className="shrink-0 text-sm text-neutral-500">
            {artwork.year}
          </span>
        </div>

        <p className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
          {artwork.movement} · {artwork.type}
        </p>
      </article>
    </Link>
  );
}