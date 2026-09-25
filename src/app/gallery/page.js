import { Suspense } from "react";
import { getAllArtworks } from "@/app/lib/museum-api";
import GalleryCollection from "@/components/GalleryCollection";

export const metadata = {
  title: "Gallery | Art Gallery",
  description: "Discover every artwork in our online museum.",
};

export default async function GalleryPage() {
  const artworks = await getAllArtworks();

  return (
    <main className="h-svh w-full shrink-0 overflow-hidden overscroll-none bg-neutral-100 text-neutral-950">
      <section className="h-full w-full">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <p className="text-sm text-neutral-500">Loading the gallery…</p>
            </div>
          }
        >
          <GalleryCollection artworks={artworks} />
        </Suspense>
      </section>
    </main>
  );
}
