import { withArtworkPlaceholder } from "@/app/lib/artwork-placeholders";

const API_URL = "https://api-museum.vercel.app";

async function fetchMuseum(path) {
  const response = await fetch(`${API_URL}${path}`, {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Museum API error: ${response.status}`);
  }

  return response.json();
}

export async function getAllArtworks() {
  const firstPage = await fetchMuseum("/objects?page=1&limit=100");

  if (!Array.isArray(firstPage.objects)) {
    throw new Error("The API response does not contain an artwork list.");
  }

  if (firstPage.totalPages <= 1) {
    return firstPage.objects.map(withArtworkPlaceholder);
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      fetchMuseum(`/objects?page=${index + 2}&limit=100`),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) =>
    page.objects.map(withArtworkPlaceholder),
  );
}

export async function getArtworkBySlug(slug) {
  const response = await fetch(
    `${API_URL}/objects/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: 3600,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Museum API error: ${response.status}`);
  }

  const artwork = await response.json();

  return withArtworkPlaceholder(artwork);
}
