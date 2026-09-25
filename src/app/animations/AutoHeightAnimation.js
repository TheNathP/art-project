"use client";

import gsap from "gsap";

export default class AutoHeightAnimation {
  constructor({ container, content, duration = 0.65, ease = "power3.inOut" }) {
    this.container = container;
    this.content = content;
    this.duration = duration;
    this.ease = ease;
    this.observer = null;
    this.frame = null;
    this.reducedMotion = false;

    this.update = this.update.bind(this);
  }

  getTargetHeight() {
    if (!this.container || !this.content) {
      return 0;
    }

    const styles = window.getComputedStyle(this.container);
    const minimumHeight = Number.parseFloat(styles.minHeight) || 0;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;

    return Math.max(
      minimumHeight,
      this.content.scrollHeight + paddingTop + paddingBottom,
    );
  }

  mount() {
    if (!this.container || !this.content) {
      return;
    }

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (this.reducedMotion) {
      return;
    }

    gsap.set(this.container, { height: this.getTargetHeight() });

    this.observer = new ResizeObserver(this.update);
    this.observer.observe(this.content);
  }

  update() {
    window.cancelAnimationFrame(this.frame);

    this.frame = window.requestAnimationFrame(() => {
      this.frame = null;

      const targetHeight = this.getTargetHeight();
      const currentHeight = this.container.getBoundingClientRect().height;

      if (Math.abs(targetHeight - currentHeight) < 0.5) {
        return;
      }

      gsap.killTweensOf(this.container, "height");
      gsap.to(this.container, {
        height: targetHeight,
        duration: this.duration,
        ease: this.ease,
        overwrite: "auto",
      });
    });
  }

  destroy() {
    window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.observer?.disconnect();
    this.observer = null;

    if (this.container) {
      gsap.killTweensOf(this.container, "height");
      gsap.set(this.container, { clearProps: "height" });
    }
  }
}
