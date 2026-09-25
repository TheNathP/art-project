import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArtworkBySlug } from "@/app/lib/museum-api";
import FavoriteButton from "@/components/FavoriteButton";
import RelatedArtworks from "@/components/RelatedArtworks";
import TransitionLink from "@/components/transitions/TransitionLink";
import { db } from "@/db";
import { favorite } from "@/db/schema";
import { auth } from "@/lib/auth";

function decodeHtmlEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getDescriptionParagraphs(description) {
  if (!description) {
    return [];
  }

  const plainText = String(description)
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(plainText)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function formatType(type) {
  const types = {
    painting: "Painting",
    sculpture: "Sculpture",
    drawing: "Drawing",
    photography: "Photography",
  };

  return types[type?.toLowerCase()] ?? type ?? "Not provided";
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return {
      title: "Artwork not found | Art Gallery",
    };
  }

  const [description] = getDescriptionParagraphs(artwork.description);

  return {
    title: `${artwork.title} | Art Gallery`,
    description:
      description?.slice(0, 160) ??
      `Discover ${artwork.title}, an artwork by ${artwork.artist}.`,
  };
}

export default async function ArtworkPage({ params }) {
  const { slug } = await params;
  const [artwork, session] = await Promise.all([
    getArtworkBySlug(slug),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!artwork) {
    notFound();
  }

  const descriptionParagraphs = getDescriptionParagraphs(artwork.description);
  const relatedArtworkReferences = Array.isArray(artwork.relatedObjects)
    ? artwork.relatedObjects
    : [];
  const relatedArtworks = (
    await Promise.all(
      relatedArtworkReferences.map(async (relatedArtwork) => {
        if (relatedArtwork.image || !relatedArtwork.slug) {
          return relatedArtwork;
        }

        try {
          return (
            (await getArtworkBySlug(relatedArtwork.slug)) ?? relatedArtwork
          );
        } catch {
          return relatedArtwork;
        }
      }),
    )
  ).filter((relatedArtwork) => relatedArtwork.slug && relatedArtwork.image);
  const favoriteRecord = session
    ? await db
        .select({ id: favorite.id })
        .from(favorite)
        .where(
          and(
            eq(favorite.userId, session.user.id),
            eq(favorite.artworkSlug, artwork.slug),
          ),
        )
        .limit(1)
    : [];

  const details = [
    ["Artist", artwork.artist ?? "Unknown artist"],
    ["Date", artwork.year ?? "Unknown date"],
    ["Type", formatType(artwork.type)],
    ["Movement", artwork.movement ?? "Not provided"],
    ["Dominant color", artwork.color ?? "Not provided"],
    ["Reference", artwork.id ?? "Not provided"],
  ];

  return (
    <main className="min-h-svh bg-stone-50 text-neutral-950">
      <article className="grid min-h-svh grid-cols-1 md:grid-cols-2">
        <section
          data-artwork-page-visual
          className="relative isolate flex min-h-[60svh] items-center justify-center overflow-hidden bg-neutral-900 px-8 py-20 md:sticky md:top-0 md:h-svh md:min-h-0 md:px-[clamp(2rem,5vw,5rem)]"
        >
          <Image
            src={artwork.image}
            alt=""
            fill
            priority
            aria-hidden="true"
            placeholder={artwork.blurDataURL ? "blur" : "empty"}
            blurDataURL={artwork.blurDataURL}
            sizes="(max-width: 767px) 100vw, 50vw"
            className="-z-20 scale-110 object-cover blur-3xl saturate-75"
          />

          <div className="absolute inset-0 -z-10 bg-black/25" />

          <div
            data-artwork-page-image
            className="relative h-[min(72svh,48rem)] w-full"
          >
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              priority
              placeholder={artwork.blurDataURL ? "blur" : "empty"}
              blurDataURL={artwork.blurDataURL}
              sizes="(max-width: 767px) 85vw, 42vw"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </section>

        <section className="flex min-h-svh flex-col px-6 pb-10 pt-12 sm:px-10 md:px-[clamp(2.5rem,6vw,6rem)] md:pb-16 md:pt-28">
          <h1 className="max-w-[14ch] break-words text-[clamp(3rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.055em] md:text-[clamp(3.25rem,5.6vw,7rem)]">
            {artwork.title}
          </h1>

          {session && (
            <FavoriteButton
              artworkSlug={artwork.slug}
              initialIsFavorite={favoriteRecord.length > 0}
            />
          )}

          <dl className="mt-12 border-b border-neutral-300">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(7rem,0.75fr)_1.25fr] gap-5 border-t border-neutral-300 py-4"
              >
                <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                  {label}
                </dt>
                <dd className="text-sm leading-6 sm:text-base">{value}</dd>
              </div>
            ))}

            <div className="grid grid-cols-[minmax(7rem,0.75fr)_1.25fr] gap-5 border-t border-neutral-300 py-4">
              <dt className="text-[0.67rem] uppercase tracking-[0.15em] text-neutral-500">
                Location
              </dt>
              <dd className="text-sm leading-6 sm:text-base">
                {artwork.locationLink ? (
                  <a
                    href={artwork.locationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-neutral-500"
                  >
                    {artwork.location ?? "View location"}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : (
                  (artwork.location ?? "Not provided")
                )}
              </dd>
            </div>
          </dl>

          {descriptionParagraphs.length > 0 && (
            <section className="border-b border-neutral-300 py-10">
              <h2 className="text-[0.68rem] uppercase tracking-[0.2em] text-neutral-500">
                Description
              </h2>

              <div className="mt-5 space-y-5 text-base leading-7 text-neutral-800 sm:text-lg sm:leading-8">
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {relatedArtworks.length > 0 && (
            <section className="border-b border-neutral-300 py-10">
              <h2 className="text-[0.68rem] uppercase tracking-[0.2em] text-neutral-500">
                Related artworks
              </h2>

              <RelatedArtworks artworks={relatedArtworks} />
            </section>
          )}

          <TransitionLink
            href="/gallery"
            className="mt-12 inline-flex w-fit items-center justify-between gap-8 border border-neutral-950 px-5 py-4 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-neutral-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 motion-reduce:transition-none"
          >
            <span aria-hidden="true">←</span>
            Back to the gallery
          </TransitionLink>
        </section>
      </article>
    </main>
  );
}
