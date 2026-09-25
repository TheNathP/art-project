"use client";

import gsap from "gsap";
import Draggable from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default class DraggableGallery {
  constructor({
    viewport,
    grid,
    draggedRef,
    hasPlayedIntroRef,
    hasPlayedRevealRef,
    enabled = true,
    suspendCardEffects = false,
    overscroll = 80,
    dragFollow = 0.11,
    dragScale = 0.75,
    dragArtworkScale = 1.1,
    dragMetadataOffset = -56,
    dragScaleInDuration = 0.5,
    dragScaleOutDuration = 0.75,
    revealDuration = 0.65,
    revealStagger = 0.3,
    artworkShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    positionEpsilon = 0.01,
  }) {
    this.viewport = viewport;
    this.grid = grid;
    this.draggedRef = draggedRef;
    this.hasPlayedIntroRef = hasPlayedIntroRef;
    this.hasPlayedRevealRef = hasPlayedRevealRef;
    this.enabled = enabled;
    this.suspendCardEffects = suspendCardEffects;
    this.overscroll = overscroll;
    this.dragFollow = dragFollow;
    this.dragScale = dragScale;
    this.dragArtworkScale = dragArtworkScale;
    this.dragMetadataOffset = dragMetadataOffset;
    this.dragScaleInDuration = dragScaleInDuration;
    this.dragScaleOutDuration = dragScaleOutDuration;
    this.revealDuration = revealDuration;
    this.revealStagger = revealStagger;
    this.artworkShadow = artworkShadow;
    this.positionEpsilon = positionEpsilon;

    this.cards = [];
    this.artworkVisuals = [];
    this.artworkMetadata = [];
    this.proxy = null;
    this.draggable = null;
    this.observer = null;
    this.resizeObserver = null;
    this.releaseTimer = null;
    this.revealTimeline = null;
    this.renderedPosition = { x: 0, y: 0 };
    this.setGridX = null;
    this.setGridY = null;
    this.reducedMotion = false;
    this.isTickerActive = false;
    this.isDragScaling = false;

    this.renderGridPosition = this.renderGridPosition.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.updateBounds = this.updateBounds.bind(this);
  }

  getAxisBounds(viewportSize, contentSize) {
    const overflow = contentSize - viewportSize;

    if (overflow <= 0) {
      const center = (viewportSize - contentSize) / 2;

      return {
        min: center - this.overscroll,
        max: center + this.overscroll,
        center,
      };
    }

    return {
      min: viewportSize - contentSize - this.overscroll,
      max: this.overscroll,
      center: (viewportSize - contentSize) / 2,
    };
  }

  getGridMetrics() {
    const horizontal = this.getAxisBounds(
      this.viewport.clientWidth,
      this.grid.offsetWidth,
    );
    const vertical = this.getAxisBounds(
      this.viewport.clientHeight,
      this.grid.offsetHeight,
    );

    return {
      bounds: {
        minX: horizontal.min,
        maxX: horizontal.max,
        minY: vertical.min,
        maxY: vertical.max,
      },
      center: {
        x: horizontal.center,
        y: vertical.center,
      },
    };
  }

  mount() {
    if (!this.viewport || !this.grid) {
      return;
    }

    this.cards = gsap.utils.toArray("[data-artwork-card]", this.grid);
    this.artworkVisuals = gsap.utils.toArray(
      "[data-artwork-visual]",
      this.grid,
    );
    this.artworkMetadata = gsap.utils.toArray("[data-artwork-meta]", this.grid);
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!this.enabled) {
      this.draggedRef.current = false;

      gsap.set(this.grid, { x: 0, y: 0, scale: 1 });
      gsap.set(this.cards, { autoAlpha: 1, scale: 1 });
      gsap.set(this.artworkVisuals, { scale: 1 });
      gsap.set(this.artworkMetadata, { y: 0 });
      this.mountGalleryReveal();
      return;
    }

    const { bounds, center } = this.getGridMetrics();

    gsap.set(this.grid, { x: center.x, y: center.y, scale: 1 });
    this.draggedRef.current = false;
    this.proxy = document.createElement("div");
    this.renderedPosition = { x: center.x, y: center.y };

    gsap.set(this.proxy, { x: center.x, y: center.y });

    this.setGridX = gsap.quickSetter(this.grid, "x", "px");
    this.setGridY = gsap.quickSetter(this.grid, "y", "px");

    gsap.ticker.add(this.renderGridPosition);
    this.isTickerActive = true;

    const animation = this;

    this.draggable = Draggable.create(this.proxy, {
      trigger: this.viewport,
      type: "x,y",
      bounds,
      inertia: !this.reducedMotion,
      edgeResistance: 0.75,
      dragResistance: 0,
      dragClickables: true,
      minimumMovement: 6,
      cursor: "grab",
      activeCursor: "grabbing",
      maxDuration: 1.2,

      onPress(event) {
        gsap.killTweensOf(animation.proxy, "x,y");
        gsap.set(animation.proxy, {
          x: animation.renderedPosition.x,
          y: animation.renderedPosition.y,
        });

        this.update(true, true);
        animation.draggedRef.current = false;

        if (!event.target.closest?.("[data-artwork-visual]")) {
          animation.startDragScale();
        }
      },

      onDragStart() {
        animation.draggedRef.current = true;
      },

      onRelease() {
        animation.stopDragScale();
        window.clearTimeout(animation.releaseTimer);
        animation.releaseTimer = window.setTimeout(() => {
          animation.draggedRef.current = false;
        }, 0);
      },
    })[0];

    this.mountCardEffects();
    this.mountGalleryReveal();

    this.resizeObserver = new ResizeObserver(this.updateBounds);
    this.resizeObserver.observe(this.viewport);
    this.resizeObserver.observe(this.grid);

    this.viewport.addEventListener("wheel", this.handleWheel, {
      passive: false,
    });
  }

  setScaleOriginToViewportCenter() {
    const originX = this.viewport.clientWidth / 2 - this.renderedPosition.x;
    const originY = this.viewport.clientHeight / 2 - this.renderedPosition.y;

    gsap.set(this.grid, {
      transformOrigin: `${originX}px ${originY}px`,
    });
  }

  startDragScale() {
    if (this.reducedMotion || this.isDragScaling) {
      return;
    }

    this.isDragScaling = true;
    this.setScaleOriginToViewportCenter();
    gsap.killTweensOf(this.grid, "scale");
    gsap.killTweensOf(this.artworkVisuals, "scale");
    gsap.killTweensOf(this.artworkMetadata, "y");
    gsap.to(this.grid, {
      scale: this.dragScale,
      duration: this.dragScaleInDuration,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(this.artworkVisuals, {
      scale: this.dragArtworkScale,
      borderRadius: "8px",
      duration: this.dragScaleInDuration,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(this.artworkMetadata, {
      y: this.dragMetadataOffset,
      duration: this.dragScaleInDuration,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  stopDragScale() {
    if (!this.isDragScaling) {
      return;
    }

    this.isDragScaling = false;
    gsap.killTweensOf(this.grid, "scale");
    gsap.killTweensOf(this.artworkVisuals, "scale");
    gsap.killTweensOf(this.artworkMetadata, "y");
    gsap.to(this.grid, {
      scale: 1,
      duration: this.reducedMotion ? 0 : this.dragScaleOutDuration,
      ease: "power3.inOut",
      overwrite: "auto",
      onComplete: () => {
        gsap.set(this.grid, { clearProps: "transformOrigin" });
      },
    });
    gsap.to(this.artworkVisuals, {
      scale: 1,
      borderRadius: "2px",
      duration: this.reducedMotion ? 0 : this.dragScaleOutDuration,
      ease: "power3.inOut",
      overwrite: "auto",
    });
    gsap.to(this.artworkMetadata, {
      y: 0,
      duration: this.reducedMotion ? 0 : this.dragScaleOutDuration,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  }

  mountCardEffects() {
    if (this.reducedMotion || this.suspendCardEffects) {
      if (this.suspendCardEffects) {
        this.hasPlayedIntroRef.current = true;
      }

      gsap.set(this.cards, { autoAlpha: 1, scale: 1 });
      return;
    }

    const shouldPlayIntro = !this.hasPlayedIntroRef.current;

    if (shouldPlayIntro) {
      this.hasPlayedIntroRef.current = true;

      gsap.fromTo(
        this.grid,
        { scale: 0.88 },
        {
          scale: 1,
          duration: 1.1,
          ease: "power3.inOut",
        },
      );
    }

    gsap.set(this.cards, {
      autoAlpha: shouldPlayIntro ? 0.15 : 1,
      scale: shouldPlayIntro ? 0.82 : 1,
    });

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          gsap.to(entry.target, {
            autoAlpha: entry.isIntersecting ? 1 : 0.15,
            scale: entry.isIntersecting ? 1 : 0.82,
            duration: 0.55,
            delay:
              shouldPlayIntro && entry.isIntersecting
                ? gsap.utils.random(0, 0.25)
                : 0,
            ease: "power2.out",
            overwrite: true,
          });
        }
      },
      {
        root: this.viewport,
        rootMargin: "8%",
        threshold: 0.01,
      },
    );

    for (const card of this.cards) {
      this.observer.observe(card);
    }
  }

  resumeCardEffects() {
    if (!this.enabled || !this.suspendCardEffects || this.observer) {
      return;
    }

    this.suspendCardEffects = false;
    this.mountCardEffects();
  }

  mountGalleryReveal() {
    if (this.suspendCardEffects || !this.hasPlayedRevealRef) {
      return;
    }

    if (this.hasPlayedRevealRef.current) {
      gsap.set(this.artworkMetadata, {
        autoAlpha: 1,
        y: 0,
        clearProps: "opacity,visibility,transform",
      });
      gsap.set(this.artworkVisuals, { clearProps: "boxShadow" });
      return;
    }

    this.hasPlayedRevealRef.current = true;

    if (this.reducedMotion) {
      gsap.set(this.artworkMetadata, {
        autoAlpha: 1,
        y: 0,
        clearProps: "opacity,visibility,transform",
      });
      gsap.set(this.artworkVisuals, { clearProps: "boxShadow" });
      return;
    }

    this.revealTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(this.artworkMetadata, {
          clearProps: "opacity,visibility,transform",
        });
        gsap.set(this.artworkVisuals, { clearProps: "boxShadow" });
        this.revealTimeline = null;
      },
    });

    this.revealTimeline
      .fromTo(
        this.artworkMetadata,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: this.revealDuration,
          ease: "power3.out",
          stagger: {
            amount: this.revealStagger,
            from: "center",
          },
        },
        0,
      )
      .fromTo(
        this.artworkVisuals,
        { boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0)" },
        {
          boxShadow: this.artworkShadow,
          duration: this.revealDuration,
          ease: "power3.out",
          stagger: {
            amount: this.revealStagger,
            from: "center",
          },
        },
        0,
      );
  }

  renderGridPosition() {
    const targetX = Number(gsap.getProperty(this.proxy, "x"));
    const targetY = Number(gsap.getProperty(this.proxy, "y"));
    const frameRatio = gsap.ticker.deltaRatio(60);
    const follow = this.reducedMotion
      ? 1
      : 1 - (1 - this.dragFollow) ** frameRatio;

    this.renderedPosition.x += (targetX - this.renderedPosition.x) * follow;
    this.renderedPosition.y += (targetY - this.renderedPosition.y) * follow;

    if (Math.abs(targetX - this.renderedPosition.x) < this.positionEpsilon) {
      this.renderedPosition.x = targetX;
    }

    if (Math.abs(targetY - this.renderedPosition.y) < this.positionEpsilon) {
      this.renderedPosition.y = targetY;
    }

    this.setGridX(this.renderedPosition.x);
    this.setGridY(this.renderedPosition.y);
  }

  handleWheel(event) {
    if (event.ctrlKey || !this.draggable || !this.proxy) {
      return;
    }

    event.preventDefault();
    gsap.killTweensOf(this.proxy, "x,y");

    const unit = event.deltaMode === 1 ? 16 : 1;
    const currentX = Number(gsap.getProperty(this.proxy, "x"));
    const currentY = Number(gsap.getProperty(this.proxy, "y"));
    const nextX = gsap.utils.clamp(
      this.draggable.minX,
      this.draggable.maxX,
      currentX - event.deltaX * unit,
    );
    const nextY = gsap.utils.clamp(
      this.draggable.minY,
      this.draggable.maxY,
      currentY - event.deltaY * unit,
    );

    gsap.to(this.proxy, {
      x: nextX,
      y: nextY,
      duration: this.reducedMotion ? 0 : 0.45,
      ease: "power3.out",
      overwrite: "auto",
      onUpdate: () => this.draggable.update(),
    });
  }

  updateBounds() {
    if (!this.draggable || !this.proxy) {
      return;
    }

    const metrics = this.getGridMetrics();

    this.draggable.applyBounds(metrics.bounds);

    gsap.set(this.proxy, {
      x: gsap.utils.clamp(
        metrics.bounds.minX,
        metrics.bounds.maxX,
        Number(gsap.getProperty(this.proxy, "x")),
      ),
      y: gsap.utils.clamp(
        metrics.bounds.minY,
        metrics.bounds.maxY,
        Number(gsap.getProperty(this.proxy, "y")),
      ),
    });

    this.draggable.update(true);
  }

  destroy() {
    this.draggedRef.current = false;
    this.isDragScaling = false;
    window.clearTimeout(this.releaseTimer);
    this.viewport?.removeEventListener("wheel", this.handleWheel);
    this.resizeObserver?.disconnect();
    this.observer?.disconnect();
    this.revealTimeline?.kill();
    this.revealTimeline = null;

    if (this.isTickerActive) {
      gsap.ticker.remove(this.renderGridPosition);
      this.isTickerActive = false;
    }

    if (this.proxy) {
      gsap.killTweensOf(this.proxy);
    }

    this.draggable?.kill();
    gsap.killTweensOf([
      this.grid,
      ...this.cards,
      ...this.artworkVisuals,
      ...this.artworkMetadata,
    ]);
    gsap.set(this.grid, { scale: 1, clearProps: "transformOrigin" });
    gsap.set(this.artworkVisuals, { scale: 1 });
    gsap.set(this.artworkMetadata, { y: 0 });

    if (this.hasPlayedRevealRef?.current) {
      gsap.set(this.artworkMetadata, {
        autoAlpha: 1,
        y: 0,
        clearProps: "opacity,visibility,transform",
      });
      gsap.set(this.artworkVisuals, { clearProps: "boxShadow" });
    }
  }
}
