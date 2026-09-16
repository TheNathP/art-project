import { Suspense } from "react";
import GalleryCollection from "@/components/GalleryCollection";
import { getAllArtworks } from "@/app/lib/museum-api";

export const metadata = {
  title: "Galerie | Art Gallery",
  description: "Découvrez toutes les œuvres de notre musée en ligne.",
};

export default async function GalleryPage() {
  const artworks = await getAllArtworks();

  return (
    <main className="h-svh w-full shrink-0 overflow-hidden overscroll-none bg-neutral-100 text-neutral-950">
      <section className="h-full w-full">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <p className="text-sm text-neutral-500">
                Chargement de la galerie…
              </p>
            </div>
          }
        >
          <GalleryCollection artworks={artworks} />
        </Suspense>
      </section>
    </main>
  );
}