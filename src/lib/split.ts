/**
 * Build-time text splitting.
 *
 * Runs on the server so the browser receives finished markup — no SplitType,
 * no runtime SplitText, and nothing hidden waiting for JS. That keeps the
 * hero's `<h1>` available as the LCP element on first paint.
 *
 * Uses Intl.Segmenter so grapheme clusters (accents, emoji) stay intact
 * instead of being torn apart by a naive `split('')`.
 */

export type Char = {
	value: string;
	/** Position within the line, exposed to CSS as `--i` for stagger. */
	index: number;
	isSpace: boolean;
};

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function splitChars(text: string): Char[] {
	return [...segmenter.segment(text)].map(({ segment }, index) => ({
		value: segment,
		index,
		isSpace: segment.trim() === '',
	}));
}
