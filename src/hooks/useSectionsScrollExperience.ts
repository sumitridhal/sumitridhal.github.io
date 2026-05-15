import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

import { useLenisScrollTrigger } from "@/hooks/useLenisScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis (GSAP ticker + ScrollTrigger scroller proxy) plus sections-page motion.
 *
 * - Section 1: scrubs to `translate(0, 20%)` (`yPercent: 20`) while section 2 moves from
 *   entering the viewport until its top hits the viewport top; progress stops there.
 * - Section 2 inner `.obsessions__scroll-shift`: scrubbed lift.
 * - Sections 3, 5 & 7: panel `<img>` backgrounds scrub from translate(0,0) to translate(0%,25%)
 *   while each section crosses the viewport (`top bottom` → `bottom top`).
 * - Sections 4 & 6: one-shot fade-up entrance.
 */
export function useSectionsScrollExperience(
  rootRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
) {
  useLenisScrollTrigger();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const main = root.querySelector("main.sections-page__main");
    if (!main) return;

    const sections = main.querySelectorAll<HTMLElement>(
      ":scope > .sections-page__section",
    );
    if (!sections.length) return;

    if (reducedMotion) {
      gsap.set(sections, { clearProps: "opacity,transform" });
      const obsShift = root.querySelector(
        "#section-2 .obsessions__scroll-shift",
      );
      if (obsShift instanceof HTMLElement) {
        gsap.set(obsShift, { clearProps: "transform" });
      }
      for (const sel of [
        "#section-3 .mood-panel__bg-img",
        "#section-5 .niche-panel__bg-img",
        "#section-7 .newsletter-panel__bg-img",
      ]) {
        const el = root.querySelector(sel);
        if (el instanceof HTMLElement) {
          gsap.set(el, { clearProps: "transform" });
        }
      }
      return;
    }

    const ctx = gsap.context(() => {
      const section1 = root.querySelector<HTMLElement>("#section-1");
      const section2 = root.querySelector<HTMLElement>("#section-2");

      if (section1 && section2) {
        gsap.fromTo(
          section1,
          { x: 0, yPercent: 0 },
          {
            x: 0,
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: section2,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      }

      sections.forEach((section) => {
        if (
          section.id === "section-1" ||
          section.id === "section-2" ||
          section.id === "section-3" ||
          section.id === "section-5" ||
          section.id === "section-7"
        ) {
          return;
        }

        gsap.from(section, {
          opacity: 0,
          y: 44,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });
      });

      const bindPanelBgParallax = (
        sectionEl: HTMLElement | null,
        imgEl: HTMLElement | null,
      ) => {
        if (!sectionEl || !imgEl) return;
        gsap.fromTo(
          imgEl,
          { x: 0, y: 0 },
          {
            xPercent: 0,
            yPercent: 25,
            ease: "none",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      };

      bindPanelBgParallax(
        root.querySelector<HTMLElement>("#section-3"),
        root.querySelector<HTMLElement>("#section-3 .mood-panel__bg-img"),
      );
      bindPanelBgParallax(
        root.querySelector<HTMLElement>("#section-5"),
        root.querySelector<HTMLElement>("#section-5 .niche-panel__bg-img"),
      );
      bindPanelBgParallax(
        root.querySelector<HTMLElement>("#section-7"),
        root.querySelector<HTMLElement>("#section-7 .newsletter-panel__bg-img"),
      );

      const obsShift = root.querySelector<HTMLElement>(
        "#section-2 .obsessions__scroll-shift",
      );
      if (obsShift && section2) {
        gsap.fromTo(
          obsShift,
          { x: 0, y: 120 },
          {
            x: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section2,
              start: "top bottom",
              end: "top 30%",
              scrub: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef, reducedMotion]);
}
