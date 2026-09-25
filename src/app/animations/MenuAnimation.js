"use client";

import gsap from "gsap";

const ITEM_SELECTOR = "[data-menu-item]";

export default class MenuAnimation {
  constructor({ root, trigger, nav, itemSelector = ITEM_SELECTOR, gap = 12 }) {
    this.root = root;
    this.trigger = trigger;
    this.nav = nav;
    this.itemSelector = itemSelector;
    this.gap = gap;

    this.timeline = null;
    this.isOpen = false;
    this.reducedMotion = false;
    this.observer = null;

    this.handleResize = this.handleResize.bind(this);
    this.handleItemsChange = this.handleItemsChange.bind(this);
  }

  getItems() {
    return this.root ? gsap.utils.toArray(this.itemSelector, this.root) : [];
  }

  getDestinations(items) {
    let offset = this.trigger.offsetHeight + this.gap;

    return items.map((item) => {
      const destination = offset;
      offset += item.offsetHeight + this.gap;
      return destination;
    });
  }

  setVerticalPositions(items) {
    const destinations = this.getDestinations(items);

    gsap.set(items, {
      y: (index) => destinations[index],
      transformOrigin: "right center",
    });
  }

  buildTimeline({ progress = this.isOpen ? 0 : 1 } = {}) {
    if (this.reducedMotion) {
      return;
    }

    const items = this.getItems();

    this.timeline?.kill();
    this.setVerticalPositions(items);

    this.timeline = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          if (!this.isOpen) {
            this.applyClosedState();
          }
        },
        onReverseComplete: () => {
          if (this.isOpen) {
            gsap.set(items, {
              clipPath: "none",
              pointerEvents: "auto",
            });
          }
        },
      })
      .fromTo(
        items,
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          rotation: 0,
          clipPath: "inset(0 0 0% 0)",
        },
        {
          autoAlpha: 0,
          x: 36,
          scale: 1,
          rotation: 0,
          clipPath: "inset(0 0 0 100%)",
          duration: 0.42,
          stagger: {
            each: 0.065,
            from: "end",
          },
          ease: "back.in(1.6)",
          immediateRender: true,
        },
        0,
      );

    this.timeline.progress(progress);

    if (progress <= 0) {
      this.applyOpenState();
    } else if (progress >= 1) {
      this.applyClosedState();
    } else {
      gsap.set(items, { pointerEvents: "none" });
    }
  }

  mount() {
    if (!this.root || !this.trigger || !this.nav) {
      return;
    }

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (this.reducedMotion) {
      this.applyClosedState();
    } else {
      this.buildTimeline({ progress: 1 });
    }

    this.observer = new MutationObserver(this.handleItemsChange);
    this.observer.observe(this.nav, { childList: true, subtree: true });
    window.addEventListener("resize", this.handleResize);
  }

  applyOpenState() {
    const items = this.getItems();

    this.setVerticalPositions(items);
    gsap.set(items, {
      autoAlpha: 1,
      x: 0,
      scale: 1,
      rotation: 0,
      clipPath: "none",
      pointerEvents: "auto",
    });
  }

  applyClosedState() {
    const items = this.getItems();

    this.setVerticalPositions(items);
    gsap.set(items, {
      autoAlpha: 0,
      x: 36,
      scale: 1,
      rotation: 0,
      clipPath: "inset(0 0 0 100%)",
      pointerEvents: "none",
    });
  }

  handleItemsChange() {
    if (this.reducedMotion) {
      if (this.isOpen) {
        this.applyOpenState();
      } else {
        this.applyClosedState();
      }
      return;
    }

    const progress = this.timeline?.progress() ?? (this.isOpen ? 0 : 1);
    const wasAnimating = this.timeline?.isActive() ?? false;

    this.buildTimeline({ progress });

    if (!wasAnimating) {
      return;
    }

    if (this.isOpen) {
      this.timeline?.reverse();
    } else {
      this.timeline?.play();
    }
  }

  open() {
    if (!this.trigger || this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (this.reducedMotion) {
      this.applyOpenState();
      return;
    }

    const items = this.getItems();

    gsap.set(items, { pointerEvents: "none" });
    this.timeline?.reverse();
  }

  close({ immediate = false } = {}) {
    if (!this.trigger || !this.isOpen) {
      return;
    }

    this.isOpen = false;

    if (immediate || this.reducedMotion) {
      this.timeline?.pause(1);
      this.applyClosedState();
      return;
    }

    gsap.set(this.getItems(), { pointerEvents: "none" });
    this.timeline?.play();
  }

  handleResize() {
    this.setVerticalPositions(this.getItems());
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.observer?.disconnect();
    this.timeline?.kill();
    gsap.killTweensOf(this.getItems());
    this.observer = null;
    this.timeline = null;
  }
}
