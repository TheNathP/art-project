"use client";

import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default class HomeHeroAnimation {
  constructor({
    root,
    title,
    description,
    cta,
    characterDuration = 0.9,
    characterStagger = 0.045,
    contentDuration = 0.7,
    ease = "power4.out",
  }) {
    this.root = root;
    this.title = title;
    this.description = description;
    this.cta = cta;
    this.characterDuration = characterDuration;
    this.characterStagger = characterStagger;
    this.contentDuration = contentDuration;
    this.ease = ease;

    this.split = null;
    this.timeline = null;
    this.hasPlayed = false;
    this.reducedMotion = false;
  }

  mount() {
    if (!this.root || !this.title || !this.description || !this.cta) {
      return;
    }

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.split = SplitText.create(this.title, {
      type: "lines,words,chars",
      mask: "chars",
      charsClass: "home-hero-char",
      aria: "auto",
    });

    gsap.set(this.root, { autoAlpha: 1 });

    if (this.reducedMotion) {
      gsap.set([this.title, this.description, this.cta], {
        clearProps: "all",
      });
      this.split.revert();
      this.split = null;
      return;
    }

    gsap.set(this.split.chars, {
      autoAlpha: 0,
      yPercent: 115,
      rotate: 3,
      transformOrigin: "50% 100%",
    });
    gsap.set([this.description, this.cta], {
      autoAlpha: 0,
      y: 24,
    });
  }

  play() {
    if (
      this.hasPlayed ||
      this.reducedMotion ||
      !this.split ||
      this.split.chars.length === 0
    ) {
      return;
    }

    this.hasPlayed = true;

    this.timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        this.timeline = null;
        gsap.set(this.split?.chars ?? [], {
          clearProps: "opacity,visibility,transform,transformOrigin",
        });
        gsap.set([this.description, this.cta], {
          clearProps: "opacity,visibility,transform",
        });
      },
    });

    this.timeline
      .to(this.split.chars, {
        autoAlpha: 1,
        yPercent: 0,
        rotate: 0,
        duration: this.characterDuration,
        stagger: this.characterStagger,
        ease: this.ease,
      })
      .to(
        this.description,
        {
          autoAlpha: 1,
          y: 0,
          duration: this.contentDuration,
          ease: "power3.out",
        },
        ">-0.3",
      )
      .to(
        this.cta,
        {
          autoAlpha: 1,
          y: 0,
          duration: this.contentDuration,
          ease: "power3.out",
        },
        ">-0.45",
      );
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
    gsap.killTweensOf([
      ...(this.split?.chars ?? []),
      this.title,
      this.description,
      this.cta,
    ]);
    this.split?.revert();
    this.split = null;
    gsap.set([this.root, this.title, this.description, this.cta], {
      clearProps: "all",
    });
  }
}
