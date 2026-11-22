import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  for (const content of document.querySelectorAll('[data-scroll-reveal]')) {
    gsap.fromTo(content, { y: 26, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: content,
        start: 'top 92%',
        once: true,
      },
    });
  }
});
