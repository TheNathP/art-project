"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { useCallback, useRef, useState } from "react";

gsap.registerPlugin(useGSAP, Flip);

const FLIP_DURATION = 1.2;
const FLIP_EASE = "power3.inOut";

function getTextElements(content) {
  return content?.querySelectorAll("[data-detail-text]") ?? [];
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function restoreArtworkElement(element, parent) {
  if (!element || !parent?.isConnected) {
    return;
  }

  if (element.parentNode !== parent) {
    parent.appendChild(element);
  }

  /*
   * L'élément ne possède pas de style inline applicatif : tous ses styles
   * inline sont ajoutés temporairement par GSAP. Les retirer directement
   * évite de faire repasser ce nœud, désormais hors de l'overlay, dans le
   * sélecteur du contexte GSAP.
   */
  element.removeAttribute("style");
}

export default function useArtworkDetails({
  overlayRef,
  surfaceRef,
  backdropRef,
  imageSlotRef,
  contentRef,
}) {
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const artworkElementRef = useRef(null);
  const originalParentRef = useRef(null);
  const sourceStateRef = useRef(null);
  const previousFocusRef = useRef(null);
  const transitionRef = useRef(null);
  const isClosingRef = useRef(false);

  const stopCurrentTransition = useCallback(() => {
    const artworkElement = artworkElementRef.current;

    transitionRef.current?.kill();
    transitionRef.current = null;

    if (artworkElement) {
      Flip.killFlipsOf(artworkElement);
    }
  }, []);

  const openArtwork = useCallback(
    (artwork, artworkElement) => {

      const originalParent = artworkElement?.parentElement;

      if (!artworkElement || !originalParent) {
        return;
      }

      stopCurrentTransition();

      const card = artworkElement.closest("[data-artwork-card]");
      const grid = artworkElement.closest("[data-gallery-grid]");

      /*
       * L'état Flip doit être mesuré dans une grille parfaitement stable.
       * Le parent de l'image reste ensuite en place et sert de destination
       * au retour, comme le conteneur .product de la référence Codrops.
       */
      if (card) {
        gsap.killTweensOf(card);
        gsap.set(card, { autoAlpha: 1, scale: 1 });
      }

      if (grid) {
        gsap.killTweensOf(grid);
        gsap.set(grid, { scale: 1 });
      }

      artworkElementRef.current = artworkElement;
      originalParentRef.current = originalParent;
      previousFocusRef.current = document.activeElement;
      sourceStateRef.current = Flip.getState(artworkElement, {
        props: "borderRadius",
      });

      setSelectedArtwork(artwork);
    },
    [stopCurrentTransition],
  );

  const { contextSafe } = useGSAP(
    () => {
      const overlay = overlayRef.current;

      if (!overlay) {
        return;
      }

      if (!selectedArtwork) {
        gsap.set(overlay, {
          autoAlpha: 0,
          pointerEvents: "none",
        });

        return;
      }

      const surface = surfaceRef.current;
      const backdrop = backdropRef.current;
      const imageSlot = imageSlotRef.current;
      const content = contentRef.current;
      const artworkElement = artworkElementRef.current;
      const originalParent = originalParentRef.current;
      const sourceState = sourceStateRef.current;

      if (
        !surface ||
        !backdrop ||
        !imageSlot ||
        !content ||
        !artworkElement ||
        !originalParent
      ) {
        return;
      }

      stopCurrentTransition();

      const textElements = getTextElements(content);
      const reducedMotion = getReducedMotionPreference();

      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
      });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(surface, { clipPath: "inset(0 0 0 100%)" });
      gsap.set(textElements, { autoAlpha: 0, y: 24 });

      /*
       * Il s'agit du même nœud DOM qu'au sein de la carte. Le slot d'origine
       * conserve les dimensions de la grille pendant que l'image est déplacée.
       */
      imageSlot.appendChild(artworkElement);

      function focusCloseButton() {
        content.querySelector("[data-details-close]")?.focus();
      }

      if (reducedMotion || !sourceState) {
        gsap.set(backdrop, { opacity: 0.48 });
        gsap.set(surface, { clipPath: "inset(0)" });
        gsap.set(textElements, { autoAlpha: 1, y: 0 });
        focusCloseButton();
      } else {
        const flip = Flip.from(sourceState, {
          targets: artworkElement,
          absolute: true,
          scale: true,
          props: "borderRadius",
          duration: FLIP_DURATION,
          ease: FLIP_EASE,
          zIndex: 210,
          onComplete: focusCloseButton,
        });

        const interfaceTimeline = gsap
          .timeline()
          .to(
            backdrop,
            {
              opacity: 0.48,
              duration: 0.6,
            },
            0,
          )
          .to(
            surface,
            {
              clipPath: "inset(0)",
              duration: FLIP_DURATION,
              ease: FLIP_EASE,
            },
            0,
          )
          .to(
            textElements,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.07,
              ease: "power3.out",
            },
            0.4,
          );

        transitionRef.current = gsap
          .timeline()
          .add(flip, 0)
          .add(interfaceTimeline, 0);
      }

      return () => {
        stopCurrentTransition();
        restoreArtworkElement(artworkElement, originalParent);
      };
    },
    {
      dependencies: [selectedArtwork?.id, stopCurrentTransition],
      revertOnUpdate: true,
    },
  );

  const closeArtwork = contextSafe(() => {
    if (!selectedArtwork || isClosingRef.current) {
        return;
    }

    const overlay = overlayRef.current;
    const surface = surfaceRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    const artworkElement = artworkElementRef.current;
    const originalParent = originalParentRef.current;

    if (
        !overlay ||
        !surface ||
        !backdrop ||
        !artworkElement ||
        !originalParent
    ) {
        return;
    }

    isClosingRef.current = true;

    const textElements = getTextElements(content);
    const reducedMotion = getReducedMotionPreference();

    stopCurrentTransition();

    let hasFinished = false;

    function finish() {
        if (hasFinished) {
            return;
        }

        hasFinished = true;

        restoreArtworkElement(artworkElement, originalParent);

        gsap.set(overlay, {
            autoAlpha: 0,
            pointerEvents: "none",
        });

        transitionRef.current = null;
        artworkElementRef.current = null;
        originalParentRef.current = null;
        sourceStateRef.current = null;

        setSelectedArtwork(null);
        previousFocusRef.current?.focus();

        isClosingRef.current = false;
    }

    if (reducedMotion || !originalParent.isConnected) {
      finish();
      return;
    }

    /*
     * La démo Codrops garde l'élément dans le slot de détail pendant tout le
     * retour. On convertit donc les deux rectangles du viewport dans le même
     * repère local : celui du slot. Aucun changement de parent n'a lieu avant
     * la fin du tween, ce qui empêche un saut de coordonnées.
     */
    const currentRect = artworkElement.getBoundingClientRect();
    const destinationRect = originalParent.getBoundingClientRect();
    const imageSlotRect = imageSlotRef.current?.getBoundingClientRect();

    if (!imageSlotRect) {
      finish();
      return;
    }

    gsap.set(artworkElement, {
      position: "absolute",
      inset: "auto",
      top: currentRect.top - imageSlotRect.top,
      left: currentRect.left - imageSlotRect.left,
      width: currentRect.width,
      height: currentRect.height,
      zIndex: 210,
    });

    const artworkTween = gsap.to(artworkElement, {
      top: destinationRect.top - imageSlotRect.top,
      left: destinationRect.left - imageSlotRect.left,
      width: destinationRect.width,
      height: destinationRect.height,
      duration: FLIP_DURATION,
      ease: FLIP_EASE,
      onComplete: finish,
    });

    const interfaceTimeline = gsap
      .timeline()
      .to(
        textElements,
        {
          autoAlpha: 0,
          y: 18,
          duration: 0.3,
          stagger: {
            each: 0.025,
            from: "end",
          },
        },
        0,
      )
      .to(
        surface,
        {
          clipPath: "inset(0 0 0 100%)",
          duration: FLIP_DURATION,
          ease: FLIP_EASE,
        },
        0,
      )
      .to(
        backdrop,
        {
          opacity: 0,
          duration: 0.6,
        },
        0,
      );

    transitionRef.current = gsap
      .timeline()
      .add(artworkTween, 0)
      .add(interfaceTimeline, 0);
  });

  return {
    selectedArtwork,
    openArtwork,
    closeArtwork,
  };
}
