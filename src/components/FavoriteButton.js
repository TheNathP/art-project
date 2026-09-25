"use client";

import { useState } from "react";

export default function FavoriteButton({ artworkSlug, initialIsFavorite }) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function toggleFavorite() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkSlug }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update this favorite.");
      }

      setIsFavorite(result.isFavorite);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update this favorite.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-8 w-fit">
      <button
        type="button"
        aria-pressed={isFavorite}
        disabled={isPending}
        onClick={toggleFavorite}
        className="inline-flex w-fit items-center gap-3 rounded-full border border-neutral-950 px-5 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:bg-neutral-950 hover:text-white disabled:cursor-wait disabled:opacity-50"
      >
        <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
        {isPending
          ? "Updating…"
          : isFavorite
            ? "Remove from favorites"
            : "Add to favorites"}
      </button>

      {error && (
        <p
          className="mt-2 max-w-72 text-xs leading-5 text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
