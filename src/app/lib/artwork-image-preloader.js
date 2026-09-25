import "client-only";

import { getWikimediaThumbnail } from "@/app/lib/wikimedia";

const MAX_TRANSITION_IMAGE_WIDTH = 1920;
const BLURRED_BACKGROUND_WIDTH = 960;
const imageCache = new Map();

function getTransitionImageWidth() {
  const renderedWidth = window.innerWidth * 0.82;
  const density = Math.min(window.devicePixelRatio || 1, 2);

  return Math.min(
    MAX_TRANSITION_IMAGE_WIDTH,
    Math.ceil(renderedWidth * density),
  );
}

function loadAndDecodeImage(src) {
  const cachedImage = imageCache.get(src);

  if (cachedImage) {
    return cachedImage;
  }

  const image = new window.Image();
  image.decoding = "async";
  image.fetchPriority = "high";

  const promise = new Promise((resolve, reject) => {
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // A completed load remains usable if decode() is not supported by the
        // browser or rejects after decoding.
      }

      resolve(src);
    };

    image.onerror = () => {
      imageCache.delete(src);
      reject(new Error(`Unable to preload image: ${src}`));
    };

    image.src = src;
  });

  const cachedEntry = { image, promise, src };
  imageCache.set(src, cachedEntry);

  return cachedEntry;
}

export function preloadArtworkTransitionImage(src) {
  const transitionSrc = getWikimediaThumbnail(src, getTransitionImageWidth());

  return {
    backgroundSrc: getWikimediaThumbnail(src, BLURRED_BACKGROUND_WIDTH),
    transitionSrc,
    ready: loadAndDecodeImage(transitionSrc).promise,
  };
}
