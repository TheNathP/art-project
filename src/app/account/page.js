import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getArtworkBySlug } from "@/app/lib/museum-api";
import AccountSettings from "@/components/AccountSettings";
import FavoriteGallery from "@/components/FavoriteGallery";
import LiquidBackground from "@/components/LiquidBackground";
import SmoothAnchorLink from "@/components/SmoothAnchorLink";
import { db } from "@/db";
import { favorite } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "My account | Art Gallery",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const favorites = await db
    .select({ artworkSlug: favorite.artworkSlug })
    .from(favorite)
    .where(eq(favorite.userId, session.user.id))
    .orderBy(desc(favorite.createdAt));

  const artworks = (
    await Promise.all(
      favorites.map(async ({ artworkSlug }) => {
        try {
          return await getArtworkBySlug(artworkSlug);
        } catch {
          return null;
        }
      }),
    )
  ).filter(Boolean);

  const favoriteLabel = `${favorites.length} favorite${favorites.length === 1 ? "" : "s"}`;

  return (
    <main className="min-h-svh overflow-x-clip bg-white text-black">
      <LiquidBackground
        height="100svh"
        primaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        secondaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        hoverSize={1.5}
        autoAnimation={false}
      >
        <section className="relative flex h-full w-full items-center overflow-hidden px-[clamp(2rem,7.5vw,6rem)] py-[clamp(4rem,10svh,7rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[92svh] w-[95svw] -translate-x-1/2 -translate-y-1/2 border-2 border-black"
          />

          <div className="relative z-30 w-full max-w-[min(78rem,82vw)]">
            <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-black/60">
              Personal space — {session.user.name}
            </p>

            <h1 className="max-w-[9ch] text-[clamp(4.3rem,11vw,9rem)] font-bold uppercase leading-[0.78] tracking-[-0.035em] text-black">
              My account
            </h1>

            <p className="mt-[clamp(2rem,4vw,3.5rem)] max-w-xl text-sm leading-relaxed text-black/70 sm:text-base">
              Revisit the artworks that inspire you and manage your personal
              space through a collection created just for you.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <SmoothAnchorLink
                href="#collection"
                className="group relative inline-flex w-fit items-center gap-7 rounded-xs border border-black bg-white px-6 py-4 text-sm font-medium uppercase tracking-[0.12em] text-black transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm"
              >
                View my collection
                <span
                  aria-hidden="true"
                  className="text-lg leading-none transition-transform duration-300 group-hover:translate-y-1 group-focus-visible:translate-y-1"
                >
                  ↓
                </span>
              </SmoothAnchorLink>

              <span className="relative inline-flex w-fit rounded-xs border border-black bg-black px-5 py-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white">
                {favoriteLabel}
              </span>
            </div>
          </div>
        </section>
      </LiquidBackground>

      <section
        id="collection"
        className="mx-auto w-full max-w-[100rem] scroll-mt-8 px-4 py-20 sm:px-8 sm:py-28 lg:px-12"
      >
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-black pb-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
              01 — Selection
            </p>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              Your personal museum
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-6 text-black/60 sm:text-base">
              An evolving selection of masterpieces to revisit whenever you
              wish.
            </p>
          </div>
          <p className="w-fit font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
            {favoriteLabel}
          </p>
        </div>

        <FavoriteGallery artworks={artworks} />

        <div className="mt-28 sm:mt-36">
          <AccountSettings user={session.user} />
        </div>
      </section>
    </main>
  );
}
