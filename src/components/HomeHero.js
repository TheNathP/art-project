"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import HomeHeroAnimation from "@/app/animations/HomeHeroAnimation";
import { SITE_FRAME_CLASSNAME } from "@/app/lib/preloader-layout";
import useSiteStore from "@/app/store/useSiteStore";
import TransitionLink from "@/components/transitions/TransitionLink";

export default function HomeHero() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const ctaRef = useRef(null);
  const animationRef = useRef(null);
  const isFirstRender = useSiteStore((state) => state.isFirstRender);
  const hasHydrated = useSiteStore((state) => state.hasHydrated);

  useLayoutEffect(() => {
    const animation = new HomeHeroAnimation({
      root: rootRef.current,
      title: titleRef.current,
      description: descriptionRef.current,
      cta: ctaRef.current,
    });

    animation.mount();
    animationRef.current = animation;

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hasHydrated && !isFirstRender) {
      animationRef.current?.play();
    }
  }, [hasHydrated, isFirstRender]);

  return (
    <section className="relative h-full w-full">
      <div
        data-home-frame
        aria-hidden="true"
        className={`pointer-events-none z-20 border-2 border-black ${SITE_FRAME_CLASSNAME}`}
      />

      <div className="flex h-full w-full items-center px-[clamp(2rem,7.5vw,6rem)] py-[clamp(4rem,10svh,7rem)]">
        <div
          ref={rootRef}
          className="invisible relative z-30 w-full max-w-[min(78rem,82vw)]"
        >
          <h1
            ref={titleRef}
            className="text-[clamp(4.5rem,11vw,9rem)] font-bold uppercase leading-[0.78] tracking-[-0.035em] text-black"
          >
            The art <br /> project
          </h1>

          <p
            ref={descriptionRef}
            className="mt-[clamp(2rem,4vw,3.5rem)] max-w-xl text-sm leading-relaxed text-black/70 sm:text-base"
          >
            A museum without borders, bringing together masterpieces from every
            era, culture and artistic movement in one place.
          </p>

          <div ref={ctaRef} className="mt-7 w-fit">
            <TransitionLink
              href="/gallery"
              className="group relative inline-flex w-fit items-center gap-7 rounded-xs border border-black bg-white px-6 py-4 text-sm font-medium uppercase tracking-[0.12em] text-black transition-[background-color,color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-color,border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:text-black hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm"
            >
              Explore the gallery
              <span
                aria-hidden="true"
                className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
              >
                →
              </span>
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
