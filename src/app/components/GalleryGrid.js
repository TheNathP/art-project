import ArtworkCard from "./ArtworkCard";

export default function GalleryGrid({ artworks, onReset }) {
  if (artworks.length === 0) {
    return (
      <div className="border-y border-neutral-300 py-16 text-center">
        <p className="text-lg">
          Aucune œuvre ne correspond à ces filtres.
        </p>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-sm underline underline-offset-4"
        >
          Effacer les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}