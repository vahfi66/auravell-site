import { gsap } from 'gsap';

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  const title = document.querySelector('#hero-title');
  if (!title.hasAttribute('data-hero-intro')) return;

  const canReveal = getComputedStyle(title).opacity === '0';
  const lines = title.children;
  if (canReveal) {
    gsap.set(lines, { y: '0.15em', opacity: 0, clipPath: 'inset(-16px -16px 88% -16px)' });
  }
  title.removeAttribute('data-hero-intro');
  if (!canReveal) return;

  gsap.to(lines, {
    y: 0,
    opacity: 1,
    clipPath: 'inset(-16px)',
    duration: 0.55,
    stagger: 0.1,
    ease: 'power3.out',
    clearProps: 'transform,opacity,clipPath',
  });
});
