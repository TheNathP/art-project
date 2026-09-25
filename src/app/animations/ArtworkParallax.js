"use client";

import gsap from "gsap";

export default class ArtworkParallax {
  constructor({
    viewport,
    grid,
    enabled = true,
    maxOffset = 10,
    maxScale = 1.04,
    influenceRadius = 320,
    followDuration = 0.65,
  }) {
    this.viewport = viewport;
    this.grid = grid;
    this.enabled = enabled;
    this.maxOffset = maxOffset;
    this.maxScale = maxScale;
    this.influenceRadius = influenceRadius;
    this.followDuration = followDuration;

    this.layers = [];
    this.entries = [];
    this.entriesByVisual = new Map();
    this.visibleEntries = new Set();
    this.observer = null;
    this.animationFrame = null;
    this.isPointerDown = false;
    this.pointerX = 0;
    this.pointerY = 0;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.render = this.render.bind(this);
  }

  mount() {
    if (!this.viewport || !this.grid) {
      return;
    }

    this.layers = gsap.utils.toArray("[data-artwork-parallax]", this.grid);

    if (
      !this.enabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      gsap.set(this.layers, { x: 0, y: 0, scale: 1 });
      return;
    }

    this.entries = this.layers
      .map((layer) => {
        const imageWrapper = layer.closest("[data-artwork-image-wrapper]");
        const visual = layer.closest("[data-artwork-visual]");

        if (!imageWrapper || !visual) {
          return null;
        }

        return {
          layer,
          imageWrapper,
          visual,
          targetX: 0,
          targetY: 0,
          targetScale: 1,
          setX: gsap.quickTo(layer, "x", {
            duration: this.followDuration,
            ease: "power3.out",
            overwrite: true,
          }),
          setY: gsap.quickTo(layer, "y", {
            duration: this.followDuration,
            ease: "power3.out",
            overwrite: true,
          }),
          setScale: gsap.quickTo(layer, "scale", {
            duration: this.followDuration,
            ease: "power3.out",
            overwrite: true,
          }),
        };
      })
      .filter(Boolean);

    this.entriesByVisual = new Map(
      this.entries.map((entry) => [entry.visual, entry]),
    );

    this.observer = new IntersectionObserver(
      (observerEntries) => {
        for (const observerEntry of observerEntries) {
          const entry = this.entriesByVisual.get(observerEntry.target);

          if (!entry) {
            continue;
          }

          if (observerEntry.isIntersecting) {
            this.visibleEntries.add(entry);
          } else {
            this.visibleEntries.delete(entry);
            this.setEntryTransform(entry, 0, 0, 1);
          }
        }
      },
      {
        root: this.viewport,
        rootMargin: "10%",
        threshold: 0,
      },
    );

    for (const entry of this.entries) {
      this.observer.observe(entry.visual);
    }

    this.viewport.addEventListener("pointermove", this.handlePointerMove);
    this.viewport.addEventListener("pointerdown", this.handlePointerDown);
    this.viewport.addEventListener("pointerleave", this.handlePointerLeave);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerUp);
  }

  setEntryTransform(entry, x, y, scale) {
    if (Math.abs(entry.targetX - x) > 0.01) {
      entry.targetX = x;
      entry.setX(x);
    }

    if (Math.abs(entry.targetY - y) > 0.01) {
      entry.targetY = y;
      entry.setY(y);
    }

    if (Math.abs(entry.targetScale - scale) > 0.001) {
      entry.targetScale = scale;
      entry.setScale(scale);
    }
  }

  reset({ immediate = false } = {}) {
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (immediate) {
      gsap.set(this.layers, { x: 0, y: 0, scale: 1 });

      for (const entry of this.entries) {
        entry.targetX = 0;
        entry.targetY = 0;
        entry.targetScale = 1;
      }

      return;
    }

    for (const entry of this.entries) {
      this.setEntryTransform(entry, 0, 0, 1);
    }
  }

  render() {
    this.animationFrame = null;

    if (this.isPointerDown) {
      return;
    }

    for (const entry of this.visibleEntries) {
      const rect = entry.visual.getBoundingClientRect();
      const imageRect = entry.imageWrapper.getBoundingClientRect();
      const nearestX = Math.max(
        rect.left - this.pointerX,
        0,
        this.pointerX - rect.right,
      );
      const nearestY = Math.max(
        rect.top - this.pointerY,
        0,
        this.pointerY - rect.bottom,
      );
      const distanceToArtwork = Math.hypot(nearestX, nearestY);

      if (distanceToArtwork >= this.influenceRadius) {
        this.setEntryTransform(entry, 0, 0, 1);
        continue;
      }

      const deltaX = this.pointerX - (rect.left + rect.width / 2);
      const deltaY = this.pointerY - (rect.top + rect.height / 2);
      const proximity = 1 - distanceToArtwork / this.influenceRadius;
      const strength = proximity ** 2;
      const scale = 1 + (this.maxScale - 1) * strength;
      const horizontalRoom = Math.min(
        this.maxOffset,
        Math.max(0, (imageRect.width * scale - rect.width) / 2 - 1),
      );
      const verticalRoom = Math.min(
        this.maxOffset,
        Math.max(0, (imageRect.height * scale - rect.height) / 2 - 1),
      );
      const x =
        gsap.utils.clamp(-1, 1, deltaX / Math.max(rect.width, 1)) *
        horizontalRoom *
        strength;
      const y =
        gsap.utils.clamp(-1, 1, deltaY / Math.max(rect.height, 1)) *
        verticalRoom *
        strength;

      this.setEntryTransform(entry, x, y, scale);
    }
  }

  scheduleRender() {
    if (this.animationFrame === null) {
      this.animationFrame = window.requestAnimationFrame(this.render);
    }
  }

  handlePointerMove(event) {
    if (event.pointerType === "touch") {
      return;
    }

    if (event.buttons > 0) {
      if (!this.isPointerDown) {
        this.isPointerDown = true;
        this.reset({ immediate: true });
      }

      return;
    }

    if (this.isPointerDown) {
      return;
    }

    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.scheduleRender();
  }

  handlePointerDown() {
    this.isPointerDown = true;
    this.reset({ immediate: true });
  }

  handlePointerUp() {
    this.isPointerDown = false;
    this.reset();
  }

  handlePointerLeave() {
    this.reset();
  }

  destroy() {
    this.observer?.disconnect();
    this.viewport?.removeEventListener("pointermove", this.handlePointerMove);
    this.viewport?.removeEventListener("pointerdown", this.handlePointerDown);
    this.viewport?.removeEventListener("pointerleave", this.handlePointerLeave);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
    this.reset({ immediate: true });
    gsap.killTweensOf(this.layers);
    this.visibleEntries.clear();
  }
}
