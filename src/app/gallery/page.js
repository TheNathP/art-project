import { Suspense } from "react";
import GalleryCollection from "@/app/components/GalleryCollection";
import { getAllArtworks } from "@/app/lib/museum-api";

export const metadata = {
  title: "Galerie | Art Gallery",
  description: "Découvrez toutes les œuvres de notre musée en ligne.",
};

export default async function GalleryPage() {
  const artworks = await getAllArtworks();

  return (
    <main className="min-h-screen bg-neutral-100 px-5 pb-16 pt-36 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
            Collection
          </p>

          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            The Gallery
          </h1>

          <p className="mt-4 max-w-xl text-neutral-600">
            Découvrez les {artworks.length} œuvres présentes dans notre
            collection.
          </p>
        </header>

        <Suspense
          fallback={
            <p className="text-sm text-neutral-500">
              Chargement de la galerie…
            </p>
          }
        >
          <GalleryCollection artworks={artworks} />
        </Suspense>
      </section>
    </main>
  );
}