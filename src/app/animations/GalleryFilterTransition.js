"use client";

import gsap from "gsap";
import { flushSync } from "react-dom";

function getArtworkIds(artworks) {
  return artworks.map((artwork) => String(artwork.id));
}

function haveSameIds(firstIds, secondIds) {
  return (
    firstIds.length === secondIds.length &&
    firstIds.every((id, index) => id === secondIds[index])
  );
}

export default class GalleryFilterTransition {
  constructor({
    gridRef,
    viewportRef,
    onRenderArtworks,
    onTransitionChange,
    exitDuration = 0.65,
    emptyDuration = 0.08,
    enterDuration = 0.8,
  }) {
    this.gridRef = gridRef;
    this.viewportRef = viewportRef;
    this.onRenderArtworks = onRenderArtworks;
    this.onTransitionChange = onTransitionChange;
    this.exitDuration = exitDuration;
    this.emptyDuration = emptyDuration;
    this.enterDuration = enterDuration;
    this.renderedIds = [];
    this.renderedSearchQuery = "";
    this.timeline = null;
    this.enterFrame = null;
    this.isDestroyed = false;
    this.transitionId = 0;
  }

  mount(initialArtworks, initialSearchQuery = "") {
    this.isDestroyed = false;
    this.renderedIds = getArtworkIds(initialArtworks);
    this.renderedSearchQuery = initialSearchQuery;
  }

  getCards() {
    const grid = this.gridRef.current;

    return grid ? gsap.utils.toArray("[data-artwork-card]", grid) : [];
  }

  stopCurrentAnimation() {
    window.cancelAnimationFrame(this.enterFrame);
    this.enterFrame = null;

    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    const cards = this.getCards();

    if (cards.length > 0) {
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: "opacity,visibility,transform" });
    }
  }

  centerGrid() {
    const grid = this.gridRef.current;
    const viewport = this.viewportRef.current;

    if (!grid || !viewport) {
      return;
    }

    if (grid.dataset.galleryView === "grid") {
      gsap.set(grid, { x: 0, y: 0, scale: 1 });
      return;
    }

    gsap.set(grid, {
      x: (viewport.clientWidth - grid.offsetWidth) / 2,
      y: (viewport.clientHeight - grid.offsetHeight) / 2,
      scale: 1,
    });
  }

  changeArtworks(nextArtworks, nextSearchQuery = "") {
    const nextIds = getArtworkIds(nextArtworks);

    if (
      haveSameIds(this.renderedIds, nextIds) &&
      this.renderedSearchQuery === nextSearchQuery
    ) {
      return;
    }

    this.stopCurrentAnimation();
    this.onTransitionChange(true);

    const transitionId = ++this.transitionId;
    const currentCards = this.getCards();

    if (currentCards.length === 0) {
      this.swapArtworks(nextArtworks, nextSearchQuery, transitionId);
      return;
    }

    this.timeline = gsap.timeline({
      onComplete: () =>
        this.swapArtworks(nextArtworks, nextSearchQuery, transitionId),
    });

    this.timeline
      .to(currentCards, {
        autoAlpha: 0,
        scale: 0.985,
        duration: this.exitDuration,
        ease: "power2.inOut",
        stagger: {
          amount: Math.min(0.12, currentCards.length * 0.008),
          from: "center",
        },
      })
      .to({}, { duration: this.emptyDuration });
  }

  swapArtworks(nextArtworks, nextSearchQuery, transitionId) {
    if (this.isDestroyed || transitionId !== this.transitionId) {
      return;
    }

    this.timeline = null;

    flushSync(() => {
      this.onRenderArtworks(nextArtworks, nextSearchQuery);
    });

    this.renderedIds = getArtworkIds(nextArtworks);
    this.renderedSearchQuery = nextSearchQuery;

    const nextCards = this.getCards();

    if (nextCards.length === 0) {
      this.finishTransition(transitionId);
      return;
    }

    gsap.set(nextCards, {
      autoAlpha: 0,
      scale: 0.985,
    });

    /*
     * The content change rebuilds Draggable and its bounds. Wait for the next
     * frame so this measurement can finish, then enforce the center while all
     * cards are still invisible.
     */
    this.enterFrame = window.requestAnimationFrame(() => {
      this.enterFrame = null;

      if (this.isDestroyed || transitionId !== this.transitionId) {
        return;
      }

      this.centerGrid();

      this.timeline = gsap.timeline({
        onComplete: () => this.finishTransition(transitionId),
      });

      this.timeline.to(nextCards, {
        autoAlpha: 1,
        scale: 1,
        duration: this.enterDuration,
        ease: "power2.out",
        stagger: {
          amount: Math.min(0.16, nextCards.length * 0.01),
          from: "center",
        },
        clearProps: "opacity,visibility,transform",
      });
    });
  }

  finishTransition(transitionId) {
    if (this.isDestroyed || transitionId !== this.transitionId) {
      return;
    }

    const cards = this.getCards();

    if (cards.length > 0) {
      gsap.set(cards, { clearProps: "opacity,visibility,transform" });
    }

    this.timeline = null;
    this.onTransitionChange(false);
  }

  destroy() {
    this.isDestroyed = true;
    this.transitionId += 1;
    this.stopCurrentAnimation();
  }
}
