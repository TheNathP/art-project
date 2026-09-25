import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const API_URL = "https://api-museum.vercel.app";
const CONCURRENCY = 1;
const IMAGE_REQUEST_INTERVAL = 500;
const PLACEHOLDER_WIDTH = 12;
const WIKIMEDIA_THUMBNAIL =
  /^(https:\/\/upload\.wikimedia\.org\/.+\/thumb\/.+)\/\d+px-([^/]+)$/;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(
  scriptDirectory,
  "../src/generated/artwork-placeholders.json",
);
let lastImageRequestAt = 0;

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

async function waitForImageRequestSlot() {
  const elapsed = Date.now() - lastImageRequestAt;
  const remainingDelay = Math.max(0, IMAGE_REQUEST_INTERVAL - elapsed);

  if (remainingDelay > 0) {
    await wait(remainingDelay);
  }

  lastImageRequestAt = Date.now();
}

function getSmallWikimediaThumbnail(src) {
  return src.replace(WIKIMEDIA_THUMBNAIL, "$1/120px-$2");
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response;

    try {
      response = await fetch(url, options);
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        await wait(750 * (attempt + 1));
      }

      continue;
    }

    if (response.ok) {
      return response;
    }

    lastError = new Error(`${response.status} ${response.statusText}`);
    lastError.status = response.status;

    const isRetryable = response.status === 429 || response.status >= 500;

    if (!isRetryable) {
      throw lastError;
    }

    if (attempt < attempts - 1) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const retryDelay =
        response.status === 429
          ? Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(30_000, 2_000 * 2 ** attempt)
          : 750 * (attempt + 1);

      await wait(retryDelay);
    }
  }

  throw lastError;
}

async function getAllArtworks() {
  const response = await fetchWithRetry(`${API_URL}/objects?page=1&limit=100`);
  const data = await response.json();

  if (!Array.isArray(data.objects)) {
    throw new Error("The API response does not contain an artwork list.");
  }

  return data.objects;
}

async function createPlaceholder(artwork) {
  const source = getSmallWikimediaThumbnail(artwork.image);
  const requestOptions = {
    headers: {
      Accept: "image/avif,image/webp,image/*,*/*",
      "User-Agent": "ArtGalleryPlaceholderGenerator/1.0",
    },
  };

  await waitForImageRequestSlot();
  let response;

  try {
    try {
      response = await fetchWithRetry(source, requestOptions, 6);
    } catch (error) {
      if (error.status !== 404 || source === artwork.image) {
        throw error;
      }

      await waitForImageRequestSlot();
      response = await fetchWithRetry(artwork.image, requestOptions, 6);
    }
  } catch (error) {
    console.warn(
      `  ↳ Image unavailable for ${artwork.title} (${error.message}); using a solid-color fallback.`,
    );

    return createFallbackPlaceholder(artwork.color);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const shouldSwapDimensions =
    metadata.orientation >= 5 && metadata.orientation <= 8;
  const imageWidth = shouldSwapDimensions ? metadata.height : metadata.width;
  const imageHeight = shouldSwapDimensions ? metadata.width : metadata.height;
  const placeholderBuffer = await image
    .rotate()
    .resize({
      width: PLACEHOLDER_WIDTH,
      height: PLACEHOLDER_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 35 })
    .toBuffer();

  return {
    blurDataURL: `data:image/webp;base64,${placeholderBuffer.toString("base64")}`,
    imageWidth,
    imageHeight,
  };
}

async function createFallbackPlaceholder(color) {
  const background = /^#[\da-f]{6}$/i.test(color ?? "") ? color : "#d4d4d4";
  const placeholderBuffer = await sharp({
    create: {
      width: PLACEHOLDER_WIDTH,
      height: PLACEHOLDER_WIDTH,
      channels: 3,
      background,
    },
  })
    .webp({ quality: 35 })
    .toBuffer();

  return {
    blurDataURL: `data:image/webp;base64,${placeholderBuffer.toString("base64")}`,
    imageWidth: 4,
    imageHeight: 3,
  };
}

function hasCompleteArtworkPlaceholder(placeholder) {
  return (
    typeof placeholder === "object" &&
    placeholder !== null &&
    typeof placeholder.blurDataURL === "string" &&
    Number.isFinite(placeholder.imageWidth) &&
    Number.isFinite(placeholder.imageHeight)
  );
}

async function readExistingPlaceholders() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writePlaceholders(placeholders) {
  const sortedPlaceholders = Object.fromEntries(
    Object.entries(placeholders).sort(([firstSlug], [secondSlug]) =>
      firstSlug.localeCompare(secondSlug),
    ),
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(sortedPlaceholders, null, 2)}\n`,
  );
}

async function mapWithConcurrency(items, concurrency, task) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await task(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  await Promise.all(workers);

  return results;
}

async function main() {
  const artworks = await getAllArtworks();
  const placeholders = await readExistingPlaceholders();

  await mapWithConcurrency(artworks, CONCURRENCY, async (artwork, index) => {
    if (!artwork.slug || !artwork.image) {
      throw new Error(`Incomplete artwork at index ${index}.`);
    }

    if (hasCompleteArtworkPlaceholder(placeholders[artwork.slug])) {
      console.log(
        `[${index + 1}/${artworks.length}] ${artwork.title} (already generated)`,
      );
      return;
    }

    const placeholder = await createPlaceholder(artwork);
    placeholders[artwork.slug] = placeholder;
    await writePlaceholders(placeholders);
    console.log(`[${index + 1}/${artworks.length}] ${artwork.title}`);
  });

  console.log(
    `\n${Object.keys(placeholders).length} placeholders written to ${outputPath}`,
  );
}

main().catch((error) => {
  console.error("Unable to generate placeholders:", error);
  process.exitCode = 1;
});
