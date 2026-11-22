import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  for (const content of document.querySelectorAll('[data-scroll-reveal]')) {
    gsap.fromTo(content, { y: 12, opacity: 0.88 }, {
      y: 0,
      opacity: 1,
      ease: 'power1.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: content,
        start: 'top bottom',
        end: () => `+=${Math.min(160, window.innerHeight * 0.24)}`,
        scrub: true,
        once: true,
      },
    });
  }
});
