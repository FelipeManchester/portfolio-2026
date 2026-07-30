/**
 * Smooth scrolling and scroll-driven timelines.
 *
 * Gated on the page actually being scrollable. With only a hero on the page
 * there is nothing for Lenis or ScrollTrigger to drive, so shipping ~45KB of
 * animation library would buy a Lighthouse penalty and no visible behaviour.
 * The moment a second section lands, this activates with no code change.
 */

const SCROLLABLE_FACTOR = 1.2;

export async function initMotion(): Promise<void> {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (document.body.scrollHeight <= window.innerHeight * SCROLLABLE_FACTOR) return;

	const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
		import('lenis'),
		import('gsap'),
		import('gsap/ScrollTrigger'),
	]);

	gsap.registerPlugin(ScrollTrigger);

	const lenis = new Lenis({
		duration: 1.1,
		easing: (t: number) => 1 - Math.pow(1 - t, 3),
	});

	// Drive Lenis from GSAP's ticker rather than its own rAF, so the two never
	// disagree about frame order.
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time: number) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
}
