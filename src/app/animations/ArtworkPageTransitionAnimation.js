"use client";

import gsap from "gsap";

function applyRect(target, rect) {
  gsap.set(target, getRectTweenVars(rect));
}

function getRectTweenVars(rect) {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function getContainedRect(aspectRatio, maxWidth, maxHeight) {
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

export default class ArtworkPageTransitionAnimation {
  constructor({
    layerRef,
    backgroundRef,
    backgroundImageRef,
    imageRef,
    duration = 1.35,
    ease = "power4.inOut",
    floatingUiSelector = "[data-gallery-floating-ui]",
  }) {
    this.layerRef = layerRef;
    this.backgroundRef = backgroundRef;
    this.backgroundImageRef = backgroundImageRef;
    this.imageRef = imageRef;
    this.duration = duration;
    this.ease = ease;
    this.floatingUiSelector = floatingUiSelector;
    this.timeline = null;
    this.floatingUiTween = null;
  }

  getReducedMotionPreference() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  stop() {
    this.timeline?.kill();
    this.floatingUiTween?.kill();
    this.timeline = null;
    this.floatingUiTween = null;
  }

  getFloatingUiElements() {
    return gsap.utils.toArray(this.floatingUiSelector);
  }

  hideFloatingUi() {
    const floatingUiElements = this.getFloatingUiElements();

    this.floatingUiTween?.kill();
    this.floatingUiTween = null;
    gsap.killTweensOf(floatingUiElements);
    gsap.set(floatingUiElements, { autoAlpha: 0, y: 24 });
  }

  showFloatingUi() {
    const floatingUiElements = this.getFloatingUiElements();

    if (floatingUiElements.length === 0) {
      return Promise.resolve();
    }

    this.floatingUiTween?.kill();
    gsap.killTweensOf(floatingUiElements);

    if (this.getReducedMotionPreference()) {
      gsap.set(floatingUiElements, {
        clearProps: "opacity,transform,visibility",
      });
      return Promise.resolve();
    }

    gsap.set(floatingUiElements, { autoAlpha: 0, y: 24 });

    return new Promise((resolve) => {
      this.floatingUiTween = gsap.to(floatingUiElements, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power3.inOut",
        stagger: 0.06,
        onComplete: () => {
          gsap.set(floatingUiElements, {
            clearProps: "opacity,transform,visibility",
          });
          this.floatingUiTween = null;
          resolve();
        },
      });
    });
  }

  prepare({ backgroundRect, imageRect }) {
    const layer = this.layerRef.current;
    const background = this.backgroundRef.current;
    const backgroundImage = this.backgroundImageRef.current;
    const image = this.imageRef.current;

    if (!layer || !background || !image) {
      return false;
    }

    this.stop();

    gsap.set(layer, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });
    applyRect(background, backgroundRect);
    applyRect(image, imageRect);
    gsap.set(backgroundImage, { scale: 1.1 });
    gsap.set(image, { autoAlpha: 1 });

    return true;
  }

  playExit({ aspectRatio }) {
    const background = this.backgroundRef.current;
    const backgroundImage = this.backgroundImageRef.current;
    const image = this.imageRef.current;

    if (!background || !image) {
      return Promise.resolve();
    }

    this.hideFloatingUi();

    const fullScreenRect = {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const fullScreenImageRect = getContainedRect(
      aspectRatio,
      window.innerWidth * 0.82,
      window.innerHeight * 0.82,
    );

    if (this.getReducedMotionPreference()) {
      applyRect(background, fullScreenRect);
      applyRect(image, fullScreenImageRect);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.timeline = gsap
        .timeline({
          defaults: {
            duration: this.duration,
            ease: this.ease,
            force3D: true,
          },
          onComplete: () => {
            this.timeline = null;
            resolve();
          },
        })
        .to(background, fullScreenRect, 0)
        .to(image, fullScreenImageRect, 0)
        .to(
          backgroundImage,
          {
            scale: 1.06,
            duration: this.duration,
            ease: this.ease,
          },
          0,
        );
    });
  }

  playEnter({ backgroundRect, imageRect }) {
    const layer = this.layerRef.current;
    const background = this.backgroundRef.current;
    const backgroundImage = this.backgroundImageRef.current;
    const image = this.imageRef.current;

    if (!layer || !background || !image) {
      return Promise.resolve();
    }

    if (this.getReducedMotionPreference()) {
      applyRect(background, backgroundRect);
      applyRect(image, imageRect);
      gsap.set(layer, { autoAlpha: 0, pointerEvents: "none" });
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.timeline = gsap
        .timeline({
          defaults: {
            duration: this.duration,
            ease: this.ease,
            force3D: true,
          },
          onComplete: () => {
            gsap.set(layer, { autoAlpha: 0, pointerEvents: "none" });
            this.timeline = null;
            resolve();
          },
        })
        .to(background, getRectTweenVars(backgroundRect), 0)
        .to(image, getRectTweenVars(imageRect), 0)
        .to(
          backgroundImage,
          {
            scale: 1.1,
            duration: this.duration,
            ease: this.ease,
          },
          0,
        )
        .to(
          layer,
          {
            autoAlpha: 0,
            duration: 0.18,
            ease: "none",
          },
          this.duration - 0.06,
        );
    });
  }

  hide() {
    const layer = this.layerRef.current;

    this.stop();

    if (layer) {
      gsap.set(layer, { autoAlpha: 0, pointerEvents: "none" });
    }
  }

  destroy() {
    this.hide();
  }
}
