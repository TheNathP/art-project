"use client";

import gsap from "gsap";
import SitePreloaderAnimation from "@/app/animations/SitePreloaderAnimation";

export default class GalleryPreloaderAnimation extends SitePreloaderAnimation {
  constructor({
    galleryRootSelector = "[data-gallery-root]",
    galleryWaitDuration = 10_000,
    imageWaitDuration = 15_000,
    frameResizeDuration = 0.9,
    distributionDuration = 1.65,
    distributionStagger = 0.9,
    backgroundRevealDuration = 0.55,
    finalFadeDuration = 0.8,
    anchorSlug = "the-milkmaid",
    floatingUiSelector = "[data-gallery-floating-ui], [data-gallery-intro-ui]",
    ...props
  }) {
    super({ ...props, floatingUiSelector });

    this.galleryRootSelector = galleryRootSelector;
    this.galleryWaitDuration = galleryWaitDuration;
    this.imageWaitDuration = imageWaitDuration;
    this.frameResizeDuration = frameResizeDuration;
    this.distributionDuration = distributionDuration;
    this.distributionStagger = distributionStagger;
    this.backgroundRevealDuration = backgroundRevealDuration;
    this.finalFadeDuration = finalFadeDuration;
    this.anchorSlug = anchorSlug;

    this.galleryRoot = null;
    this.galleryCards = [];
    this.galleryVisuals = [];
    this.galleryImageWrappers = [];
    this.galleryMetadata = [];
    this.anchorVisual = null;
    this.distributionAppended = false;
    this.illusionLayer = null;
    this.illusionClones = [];
    this.galleryObserver = null;
    this.galleryWaitTimeout = null;
    this.imageWaitTimeout = null;
    this.isDestroyed = false;
    this.hasCompleted = false;
  }

  getGalleryElements() {
    const galleryRoot = document.querySelector(this.galleryRootSelector);

    if (!galleryRoot || galleryRoot.dataset.galleryHydrated !== "true") {
      return null;
    }

    const galleryVisuals = gsap.utils.toArray(
      "[data-artwork-visual]",
      galleryRoot,
    );

    if (galleryVisuals.length === 0) {
      return null;
    }

    const anchorCard = galleryRoot.querySelector(
      `[data-artwork-card][data-artwork-slug="${this.anchorSlug}"]`,
    );

    return {
      galleryRoot,
      galleryCards: gsap.utils.toArray("[data-artwork-card]", galleryRoot),
      galleryVisuals,
      galleryImageWrappers: gsap.utils.toArray(
        "[data-artwork-image-wrapper]",
        galleryRoot,
      ),
      galleryMetadata: gsap.utils.toArray("[data-artwork-meta]", galleryRoot),
      anchorVisual:
        anchorCard?.querySelector("[data-artwork-visual]") ?? galleryVisuals[0],
    };
  }

  waitForGalleryElements() {
    const elements = this.getGalleryElements();

    if (elements) {
      return Promise.resolve(elements);
    }

    return new Promise((resolve) => {
      const finish = (result) => {
        this.galleryObserver?.disconnect();
        this.galleryObserver = null;
        window.clearTimeout(this.galleryWaitTimeout);
        this.galleryWaitTimeout = null;
        resolve(result);
      };

      this.galleryObserver = new MutationObserver(() => {
        const nextElements = this.getGalleryElements();

        if (nextElements) {
          finish(nextElements);
        }
      });

      this.galleryObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-gallery-hydrated"],
        childList: true,
        subtree: true,
      });

      this.galleryWaitTimeout = window.setTimeout(
        () => finish(null),
        this.galleryWaitDuration,
      );
    });
  }

  waitForImage(image) {
    image.loading = "eager";

    const decode = () => image.decode?.().catch(() => undefined);

    if (image.complete) {
      return decode();
    }

    return new Promise((resolve) => {
      const finish = () => {
        image.removeEventListener("load", finish);
        image.removeEventListener("error", finish);
        resolve();
      };

      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    }).then(decode);
  }

  waitForGalleryImages() {
    const images = gsap.utils.toArray("img", this.galleryRoot);
    const imagesReady = Promise.allSettled(
      images.map((image) => this.waitForImage(image)),
    );

    const timeout = new Promise((resolve) => {
      this.imageWaitTimeout = window.setTimeout(
        resolve,
        this.imageWaitDuration,
      );
    });

    return Promise.race([imagesReady, timeout]).finally(() => {
      window.clearTimeout(this.imageWaitTimeout);
      this.imageWaitTimeout = null;
    });
  }

  async prepareGallery() {
    const elements = await this.waitForGalleryElements();

    if (!elements || this.isDestroyed) {
      return false;
    }

    Object.assign(this, elements);
    this.floatingUiElements = gsap.utils.toArray(this.floatingUiSelector);

    gsap.killTweensOf([
      ...this.galleryCards,
      ...this.galleryVisuals,
      ...this.galleryImageWrappers,
      ...this.galleryMetadata,
    ]);
    gsap.set(this.floatingUiElements, { autoAlpha: 0 });
    gsap.set(this.galleryCards, { autoAlpha: 1, scale: 1 });
    gsap.set(this.galleryVisuals, {
      autoAlpha: 0,
      boxShadow: "none",
    });
    gsap.set(this.galleryImageWrappers, {
      autoAlpha: 0,
      clipPath: "inset(0% 0% 0% 0%)",
    });
    gsap.set(this.galleryMetadata, { autoAlpha: 0, y: 12 });

    await this.waitForGalleryImages();

    return !this.isDestroyed;
  }

  getAnchorBounds() {
    const bounds = this.anchorVisual?.getBoundingClientRect();

    return {
      top: bounds?.top ?? window.innerHeight / 2,
      left: bounds?.left ?? window.innerWidth / 2,
      width: bounds?.width || Math.min(window.innerWidth * 0.2, 288),
      height: bounds?.height || Math.min(window.innerWidth * 0.25, 360),
    };
  }

  removeIllusionLayer() {
    this.illusionLayer?.remove();
    this.illusionLayer = null;
    this.illusionClones = [];
  }

  createIllusionLayer() {
    this.removeIllusionLayer();

    const anchorBounds = this.frame.getBoundingClientRect();
    const layer = document.createElement("div");

    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
      position: "fixed",
      inset: "0",
      zIndex: "1",
      overflow: "visible",
      pointerEvents: "none",
    });

    this.illusionLayer = layer;
    this.root.appendChild(layer);
    gsap.set(this.frame, { zIndex: 2 });

    this.illusionClones = this.galleryVisuals.map((visual) => {
      const destination = visual.getBoundingClientRect();
      const clone = visual.cloneNode(true);

      clone.removeAttribute("data-artwork-visual");
      clone.setAttribute("aria-hidden", "true");
      layer.appendChild(clone);

      gsap.set(clone, {
        position: "fixed",
        top: anchorBounds.top,
        left: anchorBounds.left,
        right: "auto",
        bottom: "auto",
        width: anchorBounds.width,
        height: anchorBounds.height,
        autoAlpha: 1,
        transform: "none",
        boxShadow: "none",
        margin: 0,
      });

      return { clone, destination };
    });

    return this.illusionClones;
  }

  appendDistribution(timeline, position) {
    if (!timeline || this.distributionAppended) {
      return;
    }

    this.distributionAppended = true;

    if (this.galleryVisuals.length === 0) {
      timeline
        .to(
          this.root,
          {
            autoAlpha: 0,
            duration: this.revealDuration,
            ease: "power2.inOut",
          },
          position,
        )
        .to(
          this.floatingUiElements,
          {
            autoAlpha: 1,
            duration: this.revealDuration,
            ease: "power2.inOut",
          },
          position,
        );
      return;
    }

    gsap.set(this.galleryImageWrappers, {
      autoAlpha: 1,
      clipPath: "inset(0% 0% 0% 0%)",
    });
    const illusionItems = this.createIllusionLayer();
    const illusionClones = illusionItems.map(({ clone }) => clone);
    const movementEnd =
      position + this.distributionDuration + this.distributionStagger;
    const interfaceEnd =
      movementEnd +
      Math.max(this.finalFadeDuration, this.revealDuration + 0.16);

    timeline
      .to(
        this.root,
        {
          backgroundColor: "rgba(255, 255, 255, 0)",
          duration: this.backgroundRevealDuration,
          ease: "power2.inOut",
        },
        position,
      )
      .to(
        illusionClones,
        {
          top: (index) => illusionItems[index].destination.top,
          left: (index) => illusionItems[index].destination.left,
          width: (index) => illusionItems[index].destination.width,
          height: (index) => illusionItems[index].destination.height,
          duration: this.distributionDuration,
          ease: "power3.inOut",
          stagger: {
            amount: this.distributionStagger,
            from: "center",
          },
        },
        position,
      )
      .set(this.galleryVisuals, { autoAlpha: 1 }, movementEnd)
      .to(
        this.root,
        {
          autoAlpha: 0,
          duration: this.finalFadeDuration,
          ease: "power2.inOut",
        },
        movementEnd,
      )
      .to(
        this.floatingUiElements,
        {
          autoAlpha: 1,
          duration: this.revealDuration,
          ease: "power2.inOut",
        },
        movementEnd + 0.16,
      )
      .call(() => this.removeIllusionLayer(), null, interfaceEnd);
  }

  cleanupGalleryStyles({ preserveRevealState = false } = {}) {
    if (this.galleryVisuals.length > 0) {
      gsap.set(this.galleryVisuals, {
        clearProps: `opacity,visibility,transform,border,borderColor,boxSizing,maxWidth,maxHeight,minWidth,minHeight${
          preserveRevealState ? "" : ",boxShadow"
        }`,
      });
    }

    if (this.galleryImageWrappers.length > 0) {
      gsap.set(this.galleryImageWrappers, {
        clearProps: "opacity,visibility,clipPath",
      });
    }

    if (this.galleryMetadata.length > 0 && !preserveRevealState) {
      gsap.set(this.galleryMetadata, {
        clearProps: "opacity,visibility,transform",
      });
    }
  }

  play({ onComplete } = {}) {
    if (
      !this.root ||
      !this.frame ||
      !this.solidFrame ||
      !this.media ||
      !this.counter ||
      this.verticalLines.length !== 2 ||
      this.horizontalLines.length !== 2
    ) {
      onComplete?.();
      return;
    }

    this.isDestroyed = false;
    this.hasCompleted = false;
    this.distributionAppended = false;
    this.lockPage();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.setInitialFramePosition();

    gsap.set(this.root, { autoAlpha: 1, display: "block" });

    if (reducedMotion) {
      gsap.set(this.root, { autoAlpha: 0, display: "none" });
      gsap.set(this.floatingUiElements, { clearProps: "opacity,visibility" });
      this.unlockPage();
      onComplete?.();
      return;
    }

    const galleryReady = this.prepareGallery();
    const progress = { value: 0 };
    const imageWrappersToWipe = this.imageWrappers.slice(0, -1);
    const wipeInterval = this.loadingDuration / this.imageWrappers.length;
    const linePhaseDuration = this.loadingDuration * 0.4;
    const frameSwapTime = this.loadingDuration * 0.8;
    const frameResizeStart = this.loadingDuration + 0.3;
    const distributionStart = frameResizeStart + this.frameResizeDuration;

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

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.timeline = null;
        this.hasCompleted = true;
        this.removeIllusionLayer();
        this.cleanupGalleryStyles({ preserveRevealState: true });
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
      .addPause(this.loadingDuration, () => {
        galleryReady.then((isReady) => {
          if (this.isDestroyed) {
            return;
          }

          if (!isReady) {
            this.galleryVisuals = [];
          }

          this.timeline?.resume();
        });
      })
      .to(
        this.counter,
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
          top: () => this.getAnchorBounds().top,
          left: () => this.getAnchorBounds().left,
          width: () => this.getAnchorBounds().width,
          height: () => this.getAnchorBounds().height,
          autoRound: false,
          duration: this.frameResizeDuration,
          ease: this.ease,
        },
        frameResizeStart,
      )
      .to(
        this.media,
        {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          duration: this.frameResizeDuration,
          ease: this.ease,
        },
        frameResizeStart,
      )
      .addPause(distributionStart, () => {
        this.appendDistribution(this.timeline, distributionStart);
        this.timeline?.resume();
      });
  }

  destroy() {
    this.isDestroyed = true;
    this.galleryObserver?.disconnect();
    this.galleryObserver = null;
    window.clearTimeout(this.galleryWaitTimeout);
    window.clearTimeout(this.imageWaitTimeout);
    this.galleryWaitTimeout = null;
    this.imageWaitTimeout = null;
    this.removeIllusionLayer();

    gsap.killTweensOf([
      ...this.galleryCards,
      ...this.galleryVisuals,
      ...this.galleryImageWrappers,
      ...this.galleryMetadata,
    ]);
    this.cleanupGalleryStyles({ preserveRevealState: this.hasCompleted });
    super.destroy();
  }
}
