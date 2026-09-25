import type { MetadataRoute } from "next";
import { getAllArtworks } from "@/app/lib/museum-api";
import { getSiteUrl } from "@/app/lib/site-url";

export const dynamic = "force-static";

type SitemapArtwork = {
  slug?: string;
  image?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const artworks = (await getAllArtworks()) as SitemapArtwork[];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/billetterie`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const artworkPages: MetadataRoute.Sitemap = artworks
    .filter(
      (artwork): artwork is SitemapArtwork & { slug: string } =>
        typeof artwork.slug === "string" && artwork.slug.length > 0,
    )
    .map((artwork) => ({
      url: `${siteUrl}/gallery/${encodeURIComponent(artwork.slug)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: artwork.image ? [artwork.image] : undefined,
    }));

  return [...staticPages, ...artworkPages];
}
