/**
 * One requestAnimationFrame loop for the whole page.
 *
 * The pointer smoothing, the WebGL mesh and the magnetic buttons all need a
 * per-frame callback. Running three separate loops would triple the scheduling
 * overhead for no benefit, so they share this one. The loop stops itself
 * whenever nothing is subscribed.
 */

export type Frame = (deltaMs: number, now: number) => void;

const frames = new Set<Frame>();
let handle = 0;
let last = 0;

function loop(now: number): void {
	// Clamp the delta so a backgrounded tab returning to life does not produce
	// one enormous step that snaps every eased value to its target.
	const delta = last === 0 ? 16 : Math.min(now - last, 64);
	last = now;

	for (const frame of frames) frame(delta, now);

	if (frames.size > 0) {
		handle = requestAnimationFrame(loop);
	} else {
		handle = 0;
		last = 0;
	}
}

export function addFrame(frame: Frame): void {
	frames.add(frame);
	if (handle === 0) handle = requestAnimationFrame(loop);
}

export function removeFrame(frame: Frame): void {
	frames.delete(frame);
}

/** Exponential smoothing that behaves the same at 30fps and 120fps. */
export function smooth(current: number, target: number, deltaMs: number, tauMs = 120): number {
	return current + (target - current) * (1 - Math.exp(-deltaMs / tauMs));
}
