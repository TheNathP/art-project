"use client";

import gsap from "gsap";

export default class RollingNumberAnimation {
  constructor({
    root,
    current,
    duration = 0.48,
    distance = 115,
    ease = "power3.inOut",
  }) {
    this.root = root;
    this.current = current;
    this.duration = duration;
    this.distance = distance;
    this.ease = ease;
    this.timeline = null;
    this.previous = null;
  }

  play({ previousText, direction = 1 }) {
    if (!this.root || !this.current) {
      return;
    }

    this.destroy();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      gsap.set(this.current, { clearProps: "opacity,visibility,transform" });
      return;
    }

    const movementDirection = direction >= 0 ? 1 : -1;
    const previous = document.createElement("span");

    previous.textContent = previousText;
    previous.setAttribute("aria-hidden", "true");
    previous.className =
      "pointer-events-none absolute inset-0 grid place-items-center whitespace-nowrap";
    this.root.appendChild(previous);
    this.previous = previous;

    gsap.set(previous, { yPercent: 0, autoAlpha: 1 });
    gsap.set(this.current, {
      yPercent: this.distance * movementDirection,
      autoAlpha: 0,
    });

    this.timeline = gsap.timeline({
      onComplete: () => {
        previous.remove();
        this.previous = null;
        this.timeline = null;
        gsap.set(this.current, {
          clearProps: "opacity,visibility,transform",
        });
      },
    });

    this.timeline
      .to(
        previous,
        {
          yPercent: -this.distance * movementDirection,
          autoAlpha: 0,
          duration: this.duration,
          ease: this.ease,
        },
        0,
      )
      .to(
        this.current,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: this.duration,
          ease: this.ease,
        },
        0,
      );
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
    this.previous?.remove();
    this.previous = null;

    if (this.current) {
      gsap.killTweensOf(this.current);
      gsap.set(this.current, {
        clearProps: "opacity,visibility,transform",
      });
    }
  }
}
