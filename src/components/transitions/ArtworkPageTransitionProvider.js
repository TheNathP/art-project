"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import ArtworkPageTransitionAnimation from "@/app/animations/ArtworkPageTransitionAnimation";
import { preloadArtworkTransitionImage } from "@/app/lib/artwork-image-preloader";

const ArtworkPageTransitionContext = createContext(null);
const DESTINATION_SELECTOR = "[data-artwork-page-visual]";
const DESTINATION_IMAGE_SELECTOR = "[data-artwork-page-image]";
const DESTINATION_TIMEOUT = 8000;

function getAspectRatio(artwork) {
  const width = Number(artwork?.imageWidth);
  const height = Number(artwork?.imageHeight);

  if (width > 0 && height > 0) {
    return width / height;
  }

  return 4 / 5;
}

function waitForDestination() {
  return new Promise((resolve) => {
    const findDestination = () => {
      const background = document.querySelector(DESTINATION_SELECTOR);
      const image = document.querySelector(DESTINATION_IMAGE_SELECTOR);

      if (background && image) {
        return { background, image };
      }

      return null;
    };

    const currentDestination = findDestination();

    if (currentDestination) {
      resolve(currentDestination);
      return;
    }

    let hasFinished = false;
    const finish = (destination) => {
      if (hasFinished) {
        return;
      }

      hasFinished = true;
      window.clearTimeout(timeoutId);
      observer.disconnect();
      resolve(destination);
    };

    const observer = new MutationObserver(() => {
      const destination = findDestination();

      if (destination) {
        finish(destination);
      }
    });

    const timeoutId = window.setTimeout(
      () => finish(null),
      DESTINATION_TIMEOUT,
    );

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export function ArtworkPageTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const layerRef = useRef(null);
  const backgroundRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const imageRef = useRef(null);
  const pendingTransitionRef = useRef(null);
  const sourceVisualRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const [artwork, setArtwork] = useState(null);
  const [animation] = useState(
    () =>
      new ArtworkPageTransitionAnimation({
        layerRef,
        backgroundRef,
        backgroundImageRef,
        imageRef,
      }),
  );

  const preloadArtworkTransition = useCallback(
    ({ artwork: artworkToPreload, href }) => {
      if (!artworkToPreload?.image) {
        return null;
      }

      if (href) {
        router.prefetch(href);
      }

      return preloadArtworkTransitionImage(artworkToPreload.image);
    },
    [router],
  );

  const restorePage = useCallback(() => {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    if (sourceVisualRef.current?.isConnected) {
      sourceVisualRef.current.style.removeProperty("visibility");
    }

    sourceVisualRef.current = null;
    pendingTransitionRef.current = null;
    isTransitioningRef.current = false;
    setArtwork(null);
  }, []);

  const startArtworkTransition = useCallback(
    ({ href, artwork: nextArtwork, sourceVisual }) => {
      const destination = new URL(href, window.location.href);
      const isGalleryArtworkNavigation =
        pathname === "/gallery" &&
        destination.origin === window.location.origin &&
        destination.pathname.startsWith("/gallery/");

      if (
        !isGalleryArtworkNavigation ||
        !nextArtwork?.image ||
        !sourceVisual ||
        isTransitioningRef.current
      ) {
        return false;
      }

      const sourceImage = sourceVisual.querySelector("[data-artwork-visual]");

      if (!sourceImage) {
        return false;
      }

      const preloadedImage = preloadArtworkTransition({
        artwork: nextArtwork,
        href,
      });

      if (!preloadedImage) {
        return false;
      }

      isTransitioningRef.current = true;
      sourceVisualRef.current = sourceVisual;
      pendingTransitionRef.current = {
        destinationPathname: destination.pathname,
        entryStarted: false,
      };

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      preloadedImage.ready
        .catch(() => nextArtwork.image)
        .then((transitionImageSrc) => {
          if (!isTransitioningRef.current || !sourceVisual.isConnected) {
            animation.hide();
            restorePage();
            return;
          }

          flushSync(() =>
            setArtwork({
              ...nextArtwork,
              transitionBackgroundSrc: preloadedImage.backgroundSrc,
              transitionImageSrc,
            }),
          );

          const isPrepared = animation.prepare({
            backgroundRect: sourceVisual.getBoundingClientRect(),
            imageRect: sourceImage.getBoundingClientRect(),
          });

          if (!isPrepared) {
            restorePage();
            return;
          }

          sourceVisual.style.visibility = "hidden";

          animation
            .playExit({
              aspectRatio: getAspectRatio(nextArtwork),
            })
            .then(() => {
              router.push(href, { scroll: true });
            });
        })
        .catch(() => {
          animation.hide();
          restorePage();
        });

      return true;
    },
    [animation, pathname, preloadArtworkTransition, restorePage, router],
  );

  const contextValue = useMemo(
    () => ({ preloadArtworkTransition, startArtworkTransition }),
    [preloadArtworkTransition, startArtworkTransition],
  );

  useLayoutEffect(() => {
    const pendingTransition = pendingTransitionRef.current;

    if (
      pendingTransition &&
      pathname === pendingTransition.destinationPathname
    ) {
      animation.hideFloatingUi();
    }
  }, [animation, pathname]);

  useEffect(() => {
    const pendingTransition = pendingTransitionRef.current;

    if (
      !pendingTransition ||
      pendingTransition.entryStarted ||
      pathname !== pendingTransition.destinationPathname
    ) {
      return;
    }

    pendingTransition.entryStarted = true;
    let isCancelled = false;

    waitForDestination().then((destination) => {
      if (isCancelled) {
        return;
      }

      if (!destination) {
        animation.hide();
        animation.showFloatingUi();
        restorePage();
        return;
      }

      window.requestAnimationFrame(() => {
        if (isCancelled) {
          return;
        }

        animation
          .playEnter({
            backgroundRect: destination.background.getBoundingClientRect(),
            imageRect: destination.image.getBoundingClientRect(),
          })
          .then(() => {
            restorePage();
            return animation.showFloatingUi();
          });
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [animation, pathname, restorePage]);

  useEffect(
    () => () => {
      animation.destroy();
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
    },
    [animation],
  );

  return (
    <ArtworkPageTransitionContext.Provider value={contextValue}>
      {children}

      <div
        ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed inset-0 z-500 overflow-hidden opacity-0"
      >
        <div
          ref={backgroundRef}
          className="fixed overflow-hidden bg-neutral-900 will-change-[left,top,width,height]"
        >
          {artwork && (
            <Image
              ref={backgroundImageRef}
              src={artwork.transitionBackgroundSrc ?? artwork.image}
              alt=""
              fill
              unoptimized
              loading="eager"
              placeholder={artwork.blurDataURL ? "blur" : "empty"}
              blurDataURL={artwork.blurDataURL}
              sizes="100vw"
              className="scale-110 object-cover blur-3xl saturate-75 will-change-transform"
            />
          )}

          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div
          ref={imageRef}
          className="fixed will-change-[left,top,width,height,opacity]"
        >
          {artwork && (
            <Image
              src={artwork.transitionImageSrc ?? artwork.image}
              alt=""
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="82vw"
              className="object-contain drop-shadow-2xl"
            />
          )}
        </div>
      </div>
    </ArtworkPageTransitionContext.Provider>
  );
}

export function useArtworkPageTransition() {
  return useContext(ArtworkPageTransitionContext);
}
