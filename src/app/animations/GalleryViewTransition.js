"use client";

import gsap from "gsap";
import Flip from "gsap/Flip";
import { flushSync } from "react-dom";

gsap.registerPlugin(Flip);

const VIEW_MODES = new Set(["draggable", "grid"]);

export default class GalleryViewTransition {
  constructor({
    rootRef,
    onViewModeChange,
    onTransitionChange,
    initialViewMode = "draggable",
    duration = 0.9,
    ease = "power3.inOut",
    staggerAmount = 0.12,
  }) {
    this.rootRef = rootRef;
    this.onViewModeChange = onViewModeChange;
    this.onTransitionChange = onTransitionChange;
    this.viewMode = initialViewMode;
    this.duration = duration;
    this.ease = ease;
    this.staggerAmount = staggerAmount;
    this.transition = null;
    this.isTransitioning = false;
    this.isDestroyed = false;

    this.changeViewMode = this.changeViewMode.bind(this);
    this.finishTransition = this.finishTransition.bind(this);
  }

  mount() {
    this.isDestroyed = false;
  }

  finishTransition() {
    const root = this.rootRef.current;

    if (root) {
      root.inert = false;
      root.removeAttribute("aria-busy");
    }

    this.transition = null;
    this.isTransitioning = false;

    if (!this.isDestroyed) {
      this.onTransitionChange(false);
    }
  }

  changeViewMode(nextViewMode) {
    if (
      !VIEW_MODES.has(nextViewMode) ||
      nextViewMode === this.viewMode ||
      this.isTransitioning
    ) {
      return;
    }

    const root = this.rootRef.current;
    const cards = root ? gsap.utils.toArray("[data-artwork-card]", root) : [];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!root || cards.length === 0 || reducedMotion) {
      this.viewMode = nextViewMode;
      flushSync(() => this.onViewModeChange(nextViewMode));
      return;
    }

    this.isTransitioning = true;
    this.onTransitionChange(true);
    root.inert = true;
    root.setAttribute("aria-busy", "true");

    const state = Flip.getState(cards);

    this.viewMode = nextViewMode;
    flushSync(() => this.onViewModeChange(nextViewMode));

    this.transition = Flip.from(state, {
      targets: cards,
      absolute: false,
      scale: true,
      nested: true,
      duration: this.duration,
      ease: this.ease,
      stagger: {
        amount: this.staggerAmount,
        from: "center",
      },
      onComplete: this.finishTransition,
      onInterrupt: this.finishTransition,
    });
  }

  destroy() {
    this.isDestroyed = true;
    this.transition?.kill();

    const root = this.rootRef.current;

    if (root) {
      root.inert = false;
      root.removeAttribute("aria-busy");
    }

    this.transition = null;
    this.isTransitioning = false;
  }
}
