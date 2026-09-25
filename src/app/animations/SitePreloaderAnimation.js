"use client";

import gsap from "gsap";

export default class SitePreloaderAnimation {
  constructor({
    root,
    frame,
    drawnLines,
    solidFrame,
    targetFrame,
    media,
    imageWrappers,
    counter,
    loadingDuration = 4.8,
    imageWipeDuration = 0.55,
    frameDuration = 1.45,
    revealDuration = 0.7,
    floatingUiSelector = "[data-gallery-floating-ui]",
    ease = "power3.inOut",
  }) {
    this.root = root;
    this.frame = frame;
    this.drawnLines = drawnLines;
    this.verticalLines = drawnLines.filter(
      (line) => line.dataset.preloaderLine === "vertical",
    );
    this.horizontalLines = drawnLines.filter(
      (line) => line.dataset.preloaderLine === "horizontal",
    );
    this.solidFrame = solidFrame;
    this.targetFrame = targetFrame;
    this.media = media;
    this.imageWrappers = imageWrappers;
    this.counter = counter;
    this.loadingDuration = loadingDuration;
    this.imageWipeDuration = imageWipeDuration;
    this.frameDuration = frameDuration;
    this.revealDuration = revealDuration;
    this.floatingUiSelector = floatingUiSelector;
    this.ease = ease;

    this.timeline = null;
    this.floatingUiElements = [];
    this.previousHtmlOverflow = "";
    this.previousBodyOverflow = "";
    this.isPageLocked = false;
  }

  lockPage() {
    this.previousHtmlOverflow = document.documentElement.style.overflow;
    this.previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    this.isPageLocked = true;
  }

  unlockPage() {
    if (!this.isPageLocked) {
      return;
    }

    document.documentElement.style.overflow = this.previousHtmlOverflow;
    document.body.style.overflow = this.previousBodyOverflow;
    this.isPageLocked = false;
  }

  setInitialFramePosition() {
    const initialPosition = this.frame.getBoundingClientRect();

    gsap.set(this.frame, {
      position: "fixed",
      top: initialPosition.top,
      left: initialPosition.left,
      width: initialPosition.width,
      height: initialPosition.height,
      xPercent: 0,
      yPercent: 0,
    });
  }

  play({ onComplete } = {}) {
    if (
      !this.root ||
      !this.frame ||
      !this.solidFrame ||
      !this.targetFrame ||
      !this.media ||
      !this.counter ||
      this.verticalLines.length !== 2 ||
      this.horizontalLines.length !== 2
    ) {
      onComplete?.();
      return;
    }

    this.lockPage();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const progress = { value: 0 };
    const imageWrappersToWipe = this.imageWrappers.slice(0, -1);
    const wipeInterval = this.loadingDuration / this.imageWrappers.length;
    const linePhaseDuration = this.loadingDuration * 0.4;
    const frameSwapTime = this.loadingDuration * 0.8;
    const frameStart = this.loadingDuration + 0.3;

    this.floatingUiElements = gsap.utils.toArray(this.floatingUiSelector);
    this.setInitialFramePosition();

    gsap.set(this.root, { autoAlpha: 1, display: "block" });
    gsap.set(this.floatingUiElements, { autoAlpha: 0 });
    gsap.set(this.drawnLines, { autoAlpha: 1 });
    gsap.set(this.solidFrame, { autoAlpha: 0 });
    gsap.set(this.verticalLines, { scaleY: 0 });
    gsap.set(this.verticalLines[0], { transformOrigin: "50% 100%" });
    gsap.set(this.verticalLines[1], { transformOrigin: "50% 0%" });
    gsap.set(this.horizontalLines, { scaleX: 0 });
    gsap.set(this.horizontalLines[0], { transformOrigin: "0% 50%" });
    gsap.set(this.horizontalLines[1], { transformOrigin: "100% 50%" });
    gsap.set(this.imageWrappers, {
      autoAlpha: 1,
      clipPath: "inset(0% 0% 0% 0%)",
    });
    gsap.set([this.media, this.counter], { autoAlpha: 1 });

    if (reducedMotion) {
      gsap.set(this.root, { autoAlpha: 0, display: "none" });
      gsap.set(this.floatingUiElements, { clearProps: "opacity,visibility" });
      this.unlockPage();
      onComplete?.();
      return;
    }

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.timeline = null;
        gsap.set(this.root, { display: "none" });
        this.unlockPage();
        onComplete?.();
      },
    });

    this.timeline
      .to(
        this.verticalLines,
        {
          scaleY: 1,
          duration: linePhaseDuration,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        this.horizontalLines,
        {
          scaleX: 1,
          duration: linePhaseDuration,
          ease: "power2.inOut",
        },
        linePhaseDuration,
      )
      .set(this.solidFrame, { autoAlpha: 1 }, frameSwapTime)
      .set(this.drawnLines, { autoAlpha: 0 }, frameSwapTime)
      .to(
        progress,
        {
          value: 100,
          duration: this.loadingDuration,
          ease: "none",
          onUpdate: () => {
            this.counter.textContent = String(Math.round(progress.value));
          },
          onComplete: () => {
            this.counter.textContent = "100";
          },
        },
        0,
      );

    for (const [index, wrapper] of imageWrappersToWipe.entries()) {
      this.timeline.to(
        wrapper,
        {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: this.imageWipeDuration,
          ease: "power3.inOut",
        },
        Math.max(0, (index + 1) * wipeInterval - this.imageWipeDuration),
      );
    }

    this.timeline
      .to(
        [this.media, this.counter],
        {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        this.loadingDuration,
      )
      .to(
        this.frame,
        {
          top: () => this.targetFrame.getBoundingClientRect().top,
          left: () => this.targetFrame.getBoundingClientRect().left,
          width: () => this.targetFrame.getBoundingClientRect().width,
          height: () => this.targetFrame.getBoundingClientRect().height,
          autoRound: false,
          duration: this.frameDuration,
          ease: this.ease,
        },
        frameStart,
      )
      .to(
        this.root,
        {
          autoAlpha: 0,
          duration: this.revealDuration,
          ease: "power2.inOut",
        },
        frameStart + this.frameDuration,
      )
      .to(
        this.floatingUiElements,
        {
          autoAlpha: 1,
          duration: this.revealDuration,
          ease: "power2.inOut",
        },
        frameStart + this.frameDuration,
      );
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
    gsap.killTweensOf([
      this.root,
      this.frame,
      this.solidFrame,
      this.media,
      this.counter,
      ...this.drawnLines,
      ...this.imageWrappers,
      ...this.floatingUiElements,
    ]);
    gsap.set(this.floatingUiElements, { clearProps: "opacity,visibility" });
    this.unlockPage();
  }
}
