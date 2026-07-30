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

	// In-page links have to go through Lenis, or the browser's native jump
	// fights the smoothed scroll position and lands somewhere else.
	document.addEventListener('click', (event) => {
		const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
		const id = link?.getAttribute('href')?.slice(1);
		if (!id) return;
		const target = document.getElementById(id);
		if (!target) return;
		event.preventDefault();
		lenis.scrollTo(target, { offset: -24 });
		// The hash still belongs in the URL — Lenis only replaces the movement.
		history.pushState(null, '', `#${id}`);
	});

	/*
	 * Reveals. Anything already on screen when this module lands is left exactly
	 * as it is: the import happens after `load`, so setting those elements to
	 * opacity 0 first would read as content vanishing and coming back.
	 *
	 * Per element rather than per section, and with no stagger — the rows are
	 * tall enough that scrolling staggers them on its own, while a section-level
	 * trigger would fire the whole register at once.
	 */
	const fold = window.innerHeight;

	for (const el of gsap.utils.toArray<HTMLElement>('[data-reveal]')) {
		if (el.getBoundingClientRect().top < fold) continue;
		gsap.set(el, { y: 20, opacity: 0 });
		ScrollTrigger.create({
			trigger: el,
			start: 'top 88%',
			once: true,
			onEnter: () =>
				gsap.to(el, { y: 0, opacity: 1, duration: 0.85, ease: 'expo.out' }),
		});
	}

	// Section rules are drawn, not faded — the same gesture the frame hairlines
	// and the name's plotter line already use.
	for (const rule of gsap.utils.toArray<HTMLElement>('[data-reveal-rule]')) {
		if (rule.getBoundingClientRect().top < fold) continue;
		gsap.set(rule, { scaleX: 0 });
		ScrollTrigger.create({
			trigger: rule,
			start: 'top 92%',
			once: true,
			onEnter: () =>
				gsap.to(rule, { scaleX: 1, duration: 1.1, ease: 'power2.out' }),
		});
	}
}
