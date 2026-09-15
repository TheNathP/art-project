const API_URL = "https://api-museum.vercel.app";

async function fetchMuseum(path) {
  const response = await fetch(`${API_URL}${path}`, {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API Museum : ${response.status}`);
  }

  return response.json();
}

export async function getAllArtworks() {
  const firstPage = await fetchMuseum("/objects?page=1&limit=100");

  if (!Array.isArray(firstPage.objects)) {
    throw new Error("La réponse de l’API ne contient pas de liste d’œuvres.");
  }

  if (firstPage.totalPages <= 1) {
    return firstPage.objects;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      fetchMuseum(`/objects?page=${index + 2}&limit=100`),
    ),
  );

  return [
    firstPage,
    ...remainingPages,
  ].flatMap((page) => page.objects);
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
    throw new Error(`Erreur API Museum : ${response.status}`);
  }

  return response.json();
}