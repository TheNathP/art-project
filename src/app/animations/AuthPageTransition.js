"use client";

import gsap from "gsap";

const CONTENT_SELECTOR = "[data-auth-transition-content]";

export default class AuthPageTransition {
  constructor({ frame, grid, contentSelector = CONTENT_SELECTOR }) {
    this.frame = frame;
    this.grid = grid;
    this.contentSelector = contentSelector;
    this.timeline = null;
    this.lockedHeight = null;
    this.lockedGridHeight = null;
    this.reducedMotion = false;
  }

  mount() {
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }

  getContent() {
    return this.frame
      ? gsap.utils.toArray(this.contentSelector, this.frame)
      : [];
  }

  playExit() {
    this.timeline?.kill();

    if (this.reducedMotion) {
      return Promise.resolve();
    }

    const content = this.getContent();

    return new Promise((resolve) => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.timeline = null;
          resolve();
        },
      });

      this.timeline.to(content, {
        autoAlpha: 0,
        y: -14,
        duration: 0.32,
        stagger: 0.035,
        ease: "power2.inOut",
      });
    });
  }

  lockFrame() {
    if (!this.frame || !this.grid || this.reducedMotion) {
      return;
    }

    this.lockedHeight = this.frame.getBoundingClientRect().height;
    this.lockedGridHeight = this.grid.getBoundingClientRect().height;
    gsap.set(this.frame, {
      height: this.lockedHeight,
      overflow: "hidden",
    });
    gsap.set(this.grid, { height: this.lockedGridHeight });
  }

  measureTargetSize() {
    if (!this.frame || !this.grid) {
      return { frame: 0, grid: 0 };
    }

    const previousHeight = this.lockedHeight ?? this.frame.offsetHeight;
    const previousGridHeight = this.lockedGridHeight ?? this.grid.offsetHeight;

    gsap.set(this.frame, { height: "auto" });
    gsap.set(this.grid, { height: "auto" });
    const targetSize = {
      frame: this.frame.getBoundingClientRect().height,
      grid: this.grid.getBoundingClientRect().height,
    };
    gsap.set(this.frame, { height: previousHeight });
    gsap.set(this.grid, { height: previousGridHeight });

    return targetSize;
  }

  playEntry() {
    this.timeline?.kill();

    if (!this.frame || !this.grid || this.reducedMotion) {
      this.restore();
      return Promise.resolve();
    }

    const content = this.getContent();
    const targetSize = this.measureTargetSize();

    gsap.set(content, {
      autoAlpha: 0,
      y: 14,
    });

    return new Promise((resolve) => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.timeline = null;
          this.restore();
          resolve();
        },
      });

      this.timeline
        .to(this.frame, {
          height: targetSize.frame,
          duration: 0.78,
          ease: "power3.inOut",
        })
        .to(
          this.grid,
          {
            height: targetSize.grid,
            duration: 0.78,
            ease: "power3.inOut",
          },
          0,
        )
        .to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.46,
            stagger: 0.055,
            ease: "power3.out",
          },
          ">+0.05",
        );
    });
  }

  restore() {
    if (!this.frame) {
      return;
    }

    this.lockedHeight = null;
    this.lockedGridHeight = null;
    gsap.set(this.frame, { clearProps: "height,overflow" });
    gsap.set(this.grid, { clearProps: "height" });
    gsap.set(this.getContent(), {
      clearProps: "opacity,visibility,transform",
    });
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
    this.restore();
  }
}
