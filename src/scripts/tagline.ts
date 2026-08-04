/**
 * Rotating tagline — plotter settle.
 *
 * Each phrase types and deletes character by character, every glyph fading
 * and lifting into place rather than snapping in monospace-typewriter style —
 * the same settle the hero name's own letters use behind the plotter line.
 * The rotator is aria-hidden with a static sentence beside it: a live region
 * that rewrites itself constantly is hostile to screen readers, and the
 * sentences say the same thing anyway.
 */

const TYPE_MS = 42;
const DELETE_MS = 32;
const HOLD_MS = 2200;
const GAP_MS = 220;

export function initTagline(): void {
	const root = document.querySelector<HTMLElement>('[data-tagline]');
	if (!root) return;

	let phrases: string[] = [];
	try {
		phrases = JSON.parse(root.dataset.taglinePhrases ?? '[]');
	} catch {
		phrases = [];
	}
	if (phrases.length < 2) return;

	const text = root.querySelector<HTMLElement>('[data-tagline-text]');
	const caret = root.querySelector<HTMLElement>('[data-tagline-caret]');
	if (!text || !caret) return;

	// Reduced motion keeps the first phrase, which is already in the HTML.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	let index = 0;
	let spans: HTMLSpanElement[] = [];
	let paused = false;
	// True only during the post-type hold — pausing mid-type or mid-delete is
	// not worth the bookkeeping, those phases are short enough to just finish.
	let holding = false;
	let advanced = false;

	const setTyping = (typing: boolean) => caret.classList.toggle('is-typing', typing);

	// The first phrase is already sitting there as plain text (progressive
	// enhancement) — settle it into character spans in place, with no
	// entrance, so nothing replays what the visitor already saw.
	const seed = () => {
		const value = text.textContent ?? '';
		text.textContent = '';
		spans = [...value].map((ch) => {
			const span = document.createElement('span');
			span.className = 'tagline__char in';
			span.textContent = ch;
			text.appendChild(span);
			return span;
		});
	};

	const typeIn = (value: string, onDone: () => void) => {
		setTyping(true);
		let i = 0;
		const addChar = () => {
			const span = document.createElement('span');
			span.className = 'tagline__char';
			span.textContent = value[i] ?? '';
			text.appendChild(span);
			spans.push(span);
			// Next frame, so the transition actually plays from the opacity:0
			// starting state rather than snapping straight to visible.
			requestAnimationFrame(() => span.classList.add('in'));
			i += 1;
			if (i < value.length) window.setTimeout(addChar, TYPE_MS);
			else {
				setTyping(false);
				onDone();
			}
		};
		addChar();
	};

	const deleteOut = (onDone: () => void) => {
		setTyping(true);
		const removeLast = () => {
			const span = spans.pop();
			if (!span) {
				setTyping(false);
				onDone();
				return;
			}
			span.classList.remove('in');
			span.classList.add('out');
			window.setTimeout(() => {
				span.remove();
				removeLast();
			}, DELETE_MS);
		};
		removeLast();
	};

	const tryAdvance = () => {
		if (paused || !holding || advanced) return;
		advanced = true;
		holding = false;

		deleteOut(() => {
			index = (index + 1) % phrases.length;
			window.setTimeout(() => {
				advanced = false;
				typeIn(phrases[index], () => {
					holding = true;
					window.setTimeout(tryAdvance, HOLD_MS);
				});
			}, GAP_MS);
		});
	};

	const setPaused = (value: boolean) => {
		paused = value;
		if (!paused) tryAdvance();
	};

	// Hovering or focusing near the tagline means the visitor is reading it —
	// only takes effect during the hold, per the note on `holding` above.
	root.addEventListener('pointerenter', () => setPaused(true));
	root.addEventListener('pointerleave', () => setPaused(false));
	document.addEventListener('visibilitychange', () => setPaused(document.hidden));

	seed();
	holding = true;
	window.setTimeout(tryAdvance, HOLD_MS);
}
