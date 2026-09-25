"use client";

import gsap from "gsap";

const ITEM_SELECTOR = "[data-gallery-filter-item]";

export default class GalleryFiltersAnimation {
  constructor({ root, itemSelector = ITEM_SELECTOR }) {
    this.root = root;
    this.itemSelector = itemSelector;
    this.timeline = null;
    this.isOpen = false;
    this.reducedMotion = false;
  }

  getItems() {
    return this.root ? gsap.utils.toArray(this.itemSelector, this.root) : [];
  }

  applyOpenState() {
    gsap.set(this.getItems(), {
      autoAlpha: 1,
      x: 0,
      pointerEvents: "auto",
    });
  }

  applyClosedState() {
    gsap.set(this.getItems(), {
      autoAlpha: 0,
      x: 32,
      pointerEvents: "none",
    });
  }

  mount() {
    if (!this.root) {
      return;
    }

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (this.reducedMotion) {
      this.applyClosedState();
      return;
    }

    const items = this.getItems();

    this.timeline = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          if (!this.isOpen) {
            this.applyClosedState();
          }
        },
        onReverseComplete: () => {
          if (this.isOpen) {
            gsap.set(items, { pointerEvents: "auto" });
          }
        },
      })
      .fromTo(
        items,
        {
          autoAlpha: 1,
          x: 0,
        },
        {
          autoAlpha: 0,
          x: 32,
          duration: 0.42,
          stagger: {
            each: 0.065,
            from: "start",
          },
          ease: "back.in(1.6)",
          immediateRender: true,
        },
      );

    this.timeline.progress(1);
    this.applyClosedState();
  }

  open() {
    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (this.reducedMotion) {
      this.applyOpenState();
      return;
    }

    gsap.set(this.getItems(), { pointerEvents: "none" });
    this.timeline?.reverse();
  }

  close({ immediate = false } = {}) {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;

    if (immediate || this.reducedMotion) {
      this.timeline?.pause(1);
      this.applyClosedState();
      return;
    }

    gsap.set(this.getItems(), { pointerEvents: "none" });
    this.timeline?.play();
  }

  destroy() {
    this.timeline?.kill();
    gsap.killTweensOf(this.getItems());
    this.timeline = null;
  }
}
