import artworkPlaceholders from "@/generated/artwork-placeholders.json";

export function withArtworkPlaceholder(artwork) {
  const placeholder = artworkPlaceholders[artwork.slug];

  if (!placeholder) {
    return artwork;
  }

  if (typeof placeholder === "string") {
    return {
      ...artwork,
      blurDataURL: placeholder,
    };
  }

  return {
    ...artwork,
    ...placeholder,
  };
}
