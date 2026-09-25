"use client";

import gsap from "gsap";

const LINK_SELECTOR = "[data-related-artwork-link]";
const PREVIEW_SELECTOR = "[data-related-artwork-preview]";

export default class RelatedArtworkPreviewAnimation {
  constructor({
    root,
    linkSelector = LINK_SELECTOR,
    previewSelector = PREVIEW_SELECTOR,
    pointerGap = 24,
    viewportGap = 16,
    followDuration = 0.38,
  }) {
    this.root = root;
    this.linkSelector = linkSelector;
    this.previewSelector = previewSelector;
    this.pointerGap = pointerGap;
    this.viewportGap = viewportGap;
    this.followDuration = followDuration;

    this.entries = new Map();
    this.links = [];
    this.previews = [];
    this.activeEntry = null;
    this.isEnabled = false;

    this.handleScroll = this.handleScroll.bind(this);
  }

  mount() {
    if (!this.root) {
      return;
    }

    this.links = gsap.utils.toArray(this.linkSelector, this.root);
    this.previews = gsap.utils.toArray(this.previewSelector, this.root);
    this.isEnabled = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    gsap.set(this.previews, {
      autoAlpha: 0,
      scale: 0.92,
      transformOrigin: "center center",
    });

    if (!this.isEnabled) {
      return;
    }

    const previewsById = new Map(
      this.previews.map((preview) => [preview.dataset.previewId, preview]),
    );

    for (const link of this.links) {
      const preview = previewsById.get(link.dataset.previewId);

      if (!preview) {
        continue;
      }

      const entry = {
        link,
        preview,
        isPositioned: false,
        setX: gsap.quickTo(preview, "x", {
          duration: this.followDuration,
          ease: "power3.out",
          overwrite: "auto",
        }),
        setY: gsap.quickTo(preview, "y", {
          duration: this.followDuration,
          ease: "power3.out",
          overwrite: "auto",
        }),
      };

      entry.handleEnter = (event) => this.show(entry, event);
      entry.handleMove = (event) => this.move(entry, event);
      entry.handleLeave = () => this.hide(entry);
      entry.handleClick = () => this.hide(entry, { immediate: true });

      link.addEventListener("pointerenter", entry.handleEnter);
      link.addEventListener("pointermove", entry.handleMove);
      link.addEventListener("pointerleave", entry.handleLeave);
      link.addEventListener("click", entry.handleClick);
      this.entries.set(link, entry);
    }

    window.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  getPosition(preview, clientX, clientY) {
    const rect = preview.getBoundingClientRect();
    let x = clientX + this.pointerGap;
    let y = clientY + this.pointerGap;

    if (x + rect.width > window.innerWidth - this.viewportGap) {
      x = clientX - rect.width - this.pointerGap;
    }

    if (y + rect.height > window.innerHeight - this.viewportGap) {
      y = clientY - rect.height - this.pointerGap;
    }

    return {
      x: gsap.utils.clamp(
        this.viewportGap,
        Math.max(
          this.viewportGap,
          window.innerWidth - rect.width - this.viewportGap,
        ),
        x,
      ),
      y: gsap.utils.clamp(
        this.viewportGap,
        Math.max(
          this.viewportGap,
          window.innerHeight - rect.height - this.viewportGap,
        ),
        y,
      ),
    };
  }

  position(entry, event, { immediate = false } = {}) {
    const position = this.getPosition(
      entry.preview,
      event.clientX,
      event.clientY,
    );

    if (immediate || !entry.isPositioned) {
      gsap.set(entry.preview, position);
      entry.isPositioned = true;
      return;
    }

    entry.setX(position.x);
    entry.setY(position.y);
  }

  show(entry, event) {
    if (!this.isEnabled) {
      return;
    }

    if (this.activeEntry && this.activeEntry !== entry) {
      this.hide(this.activeEntry, { immediate: true });
    }

    this.activeEntry = entry;
    this.position(entry, event, { immediate: true });
    gsap.killTweensOf(entry.preview, "opacity,visibility,scale");
    gsap.to(entry.preview, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  move(entry, event) {
    if (this.activeEntry === entry) {
      this.position(entry, event);
    }
  }

  hide(entry, { immediate = false } = {}) {
    if (!entry) {
      return;
    }

    if (this.activeEntry === entry) {
      this.activeEntry = null;
    }

    gsap.killTweensOf(entry.preview, "opacity,visibility,scale");

    if (immediate) {
      gsap.set(entry.preview, { autoAlpha: 0, scale: 0.92 });
      entry.isPositioned = false;
      return;
    }

    gsap.to(entry.preview, {
      autoAlpha: 0,
      scale: 0.94,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        entry.isPositioned = false;
      },
    });
  }

  handleScroll() {
    this.hide(this.activeEntry, { immediate: true });
  }

  destroy() {
    window.removeEventListener("scroll", this.handleScroll);

    for (const entry of this.entries.values()) {
      entry.link.removeEventListener("pointerenter", entry.handleEnter);
      entry.link.removeEventListener("pointermove", entry.handleMove);
      entry.link.removeEventListener("pointerleave", entry.handleLeave);
      entry.link.removeEventListener("click", entry.handleClick);
    }

    gsap.killTweensOf(this.previews);
    gsap.set(this.previews, { clearProps: "opacity,visibility,transform" });
    this.entries.clear();
    this.activeEntry = null;
  }
}
