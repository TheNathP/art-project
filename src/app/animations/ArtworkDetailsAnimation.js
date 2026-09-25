"use client";

import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

export default class ArtworkDetailsAnimation {
  constructor({
    overlayRef,
    surfaceRef,
    backdropRef,
    imageSlotRef,
    contentRef,
    duration = 1.2,
    ease = "power3.inOut",
    floatingUiSelector = "[data-gallery-floating-ui]",
  }) {
    this.overlayRef = overlayRef;
    this.surfaceRef = surfaceRef;
    this.backdropRef = backdropRef;
    this.imageSlotRef = imageSlotRef;
    this.contentRef = contentRef;
    this.duration = duration;
    this.ease = ease;
    this.floatingUiSelector = floatingUiSelector;

    this.artworkElement = null;
    this.originalParent = null;
    this.sourceState = null;
    this.previousFocus = null;
    this.transition = null;
    this.isClosing = false;
  }

  getTextElements() {
    return (
      this.overlayRef.current?.querySelectorAll("[data-detail-text]") ?? []
    );
  }

  getReducedMotionPreference() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  restoreArtworkElement(
    element = this.artworkElement,
    parent = this.originalParent,
  ) {
    if (!element || !parent?.isConnected) {
      return;
    }

    if (element.parentNode !== parent) {
      parent.appendChild(element);
    }

    element.removeAttribute("style");
  }

  stop() {
    this.transition?.kill();
    this.transition = null;

    if (this.artworkElement) {
      Flip.killFlipsOf(this.artworkElement);
    }
  }

  prepare(artworkElement) {
    const originalParent = artworkElement?.parentElement;

    if (!artworkElement || !originalParent || this.isClosing) {
      return false;
    }

    this.stop();

    const card = artworkElement.closest("[data-artwork-card]");
    const grid = artworkElement.closest("[data-gallery-grid]");

    if (card) {
      gsap.killTweensOf(card);
      gsap.set(card, { autoAlpha: 1, scale: 1 });
    }

    if (grid) {
      gsap.killTweensOf(grid);
      gsap.set(grid, { scale: 1 });
    }

    this.artworkElement = artworkElement;
    this.originalParent = originalParent;
    this.previousFocus = document.activeElement;
    this.sourceState = Flip.getState(artworkElement, {
      props: "borderRadius",
    });

    return true;
  }

  hide() {
    const overlay = this.overlayRef.current;

    if (overlay) {
      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: "none",
      });
    }
  }

  open() {
    const overlay = this.overlayRef.current;
    const surface = this.surfaceRef.current;
    const backdrop = this.backdropRef.current;
    const imageSlot = this.imageSlotRef.current;
    const content = this.contentRef.current;
    const artworkElement = this.artworkElement;
    const originalParent = this.originalParent;
    const sourceState = this.sourceState;

    if (
      !overlay ||
      !surface ||
      !backdrop ||
      !imageSlot ||
      !content ||
      !artworkElement ||
      !originalParent
    ) {
      return;
    }

    this.stop();

    const textElements = this.getTextElements();
    const visualBackground = overlay.querySelector(
      "[data-detail-visual-background]",
    );
    const scrollContainer = overlay.querySelector("[data-details-scroll]");
    const floatingUiElements = gsap.utils.toArray(this.floatingUiSelector);
    const reducedMotion = this.getReducedMotionPreference();

    gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(surface, { xPercent: 100 });
    gsap.set(textElements, { autoAlpha: 0, x: 40 });
    gsap.set(visualBackground, {
      autoAlpha: 1,
      xPercent: 100,
      scale: 1.05,
    });
    gsap.killTweensOf(floatingUiElements);
    gsap.set(scrollContainer, { overflow: "visible" });

    imageSlot.appendChild(artworkElement);

    const finishOpening = () => {
      gsap.set(scrollContainer, { clearProps: "overflow" });
      overlay.querySelector("[data-details-close]")?.focus();
    };

    if (reducedMotion || !sourceState) {
      gsap.set(backdrop, { opacity: 0.48 });
      gsap.set(surface, { xPercent: 0 });
      gsap.set(textElements, { autoAlpha: 1, x: 0 });
      gsap.set(visualBackground, {
        autoAlpha: 1,
        xPercent: 0,
        scale: 1,
      });
      gsap.set(floatingUiElements, { autoAlpha: 0, y: 24 });
      finishOpening();
    } else {
      const flip = Flip.from(sourceState, {
        targets: artworkElement,
        absolute: true,
        scale: false,
        props: "borderRadius",
        duration: this.duration,
        ease: this.ease,
        zIndex: 210,
      });

      const interfaceTimeline = gsap
        .timeline({ onComplete: finishOpening })
        .to(
          floatingUiElements,
          {
            autoAlpha: 0,
            y: 24,
            duration: 0.65,
            ease: "power3.inOut",
            stagger: 0.06,
          },
          0,
        )
        .to(backdrop, { opacity: 0.48, duration: 0.6 }, 0)
        .to(
          surface,
          {
            xPercent: 0,
            duration: this.duration,
            ease: this.ease,
            force3D: true,
          },
          0,
        )
        .to(
          visualBackground,
          {
            xPercent: 0,
            scale: 1,
            duration: this.duration,
            ease: this.ease,
            force3D: true,
          },
          0,
        )
        .to(
          textElements,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
          },
          this.duration,
        );

      this.transition = gsap.timeline().add(flip, 0).add(interfaceTimeline, 0);
    }

    return () => {
      this.stop();
      this.restoreArtworkElement(artworkElement, originalParent);
    };
  }

  close({ onComplete } = {}) {
    if (this.isClosing) {
      return;
    }

    const overlay = this.overlayRef.current;
    const surface = this.surfaceRef.current;
    const backdrop = this.backdropRef.current;
    const imageSlot = this.imageSlotRef.current;
    const artworkElement = this.artworkElement;
    const originalParent = this.originalParent;

    if (
      !overlay ||
      !surface ||
      !backdrop ||
      !imageSlot ||
      !artworkElement ||
      !originalParent
    ) {
      return;
    }

    this.isClosing = true;

    const textElements = this.getTextElements();
    const visualBackground = overlay.querySelector(
      "[data-detail-visual-background]",
    );
    const scrollContainer = overlay.querySelector("[data-details-scroll]");
    const floatingUiElements = gsap.utils.toArray(this.floatingUiSelector);
    const reducedMotion = this.getReducedMotionPreference();

    this.stop();
    gsap.set(scrollContainer, { overflow: "visible" });

    let hasFinished = false;

    const finish = () => {
      if (hasFinished) {
        return;
      }

      hasFinished = true;
      this.restoreArtworkElement(artworkElement, originalParent);
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(scrollContainer, { clearProps: "overflow" });

      this.transition = null;
      this.artworkElement = null;
      this.originalParent = null;
      this.sourceState = null;
      this.isClosing = false;

      onComplete?.();
      this.previousFocus?.focus();
      this.previousFocus = null;
    };

    if (reducedMotion || !originalParent.isConnected) {
      gsap.set(floatingUiElements, { autoAlpha: 1, y: 0 });
      finish();
      return;
    }

    const currentRect = artworkElement.getBoundingClientRect();
    const destinationRect = originalParent.getBoundingClientRect();
    const imageSlotRect = imageSlot.getBoundingClientRect();

    gsap.set(artworkElement, {
      position: "absolute",
      inset: "auto",
      top: currentRect.top - imageSlotRect.top,
      left: currentRect.left - imageSlotRect.left,
      width: currentRect.width,
      height: currentRect.height,
      zIndex: 210,
    });

    const artworkTween = gsap.to(artworkElement, {
      top: destinationRect.top - imageSlotRect.top,
      left: destinationRect.left - imageSlotRect.left,
      width: destinationRect.width,
      height: destinationRect.height,
      duration: this.duration,
      ease: this.ease,
      onComplete: finish,
    });

    const interfaceTimeline = gsap
      .timeline()
      .to(
        floatingUiElements,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        },
        this.duration - 0.55,
      )
      .to(
        visualBackground,
        {
          xPercent: 100,
          scale: 1,
          duration: this.duration,
          ease: this.ease,
          force3D: true,
        },
        0,
      )
      .to(
        textElements,
        {
          autoAlpha: 0,
          x: 40,
          duration: 0.3,
          stagger: { each: 0.025, from: "end" },
          ease: "power2.in",
        },
        0,
      )
      .to(
        surface,
        {
          xPercent: 100,
          duration: this.duration,
          ease: this.ease,
          force3D: true,
        },
        0,
      )
      .to(backdrop, { opacity: 0, duration: 0.6 }, 0.4);

    this.transition = gsap
      .timeline()
      .add(artworkTween, 0)
      .add(interfaceTimeline, 0);
  }

  destroy() {
    this.stop();
    this.restoreArtworkElement();
    this.hide();
    this.artworkElement = null;
    this.originalParent = null;
    this.sourceState = null;
    this.previousFocus = null;
    this.isClosing = false;
  }
}
