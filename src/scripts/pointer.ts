import { addFrame, removeFrame, smooth, type Frame } from './ticker';

/**
 * Smoothed pointer position, shared by everything that reacts to the cursor.
 *
 * `x`/`y` are normalised 0..1 across the viewport and eased; `dx`/`dy` are the
 * same value remapped to -1..1 from the centre.
 */
export const pointer = {
	x: 0.5,
	y: 0.5,
	dx: 0,
	dy: 0,
	/** True once the visitor has actually moved a fine pointer. */
	engaged: false,
};

let targetX = 0.5;
let targetY = 0.5;
let started = false;
let idleFrames = 0;

const frame: Frame = (delta) => {
	pointer.x = smooth(pointer.x, targetX, delta);
	pointer.y = smooth(pointer.y, targetY, delta);
	pointer.dx = (pointer.x - 0.5) * 2;
	pointer.dy = (pointer.y - 0.5) * 2;

	// Park the loop once the eased value has caught up, so an idle page costs
	// nothing. Any further pointermove restarts it.
	const settled = Math.abs(targetX - pointer.x) < 0.0005 && Math.abs(targetY - pointer.y) < 0.0005;
	idleFrames = settled ? idleFrames + 1 : 0;
	if (idleFrames > 4) stop();
};

function stop(): void {
	removeFrame(frame);
	started = false;
	idleFrames = 0;
}

function start(): void {
	if (started) return;
	started = true;
	idleFrames = 0;
	addFrame(frame);
}

let listening = false;

/**
 * Only fine pointers are tracked. On touch there is no hover state to react
 * to, and the listeners would run during every scroll for nothing.
 *
 * Safe to call from every layer that reads `pointer`, so a caller never has to
 * know whether another layer already got here first.
 */
export function initPointer(): void {
	if (listening) return;
	if (!window.matchMedia('(pointer: fine)').matches) return;
	listening = true;

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
			targetX = event.clientX / window.innerWidth;
			targetY = event.clientY / window.innerHeight;
			pointer.engaged = true;
			start();
		},
		{ passive: true },
	);
}

/** Lets the mesh keep the shared loop alive while it is rendering. */
export { addFrame, removeFrame } from './ticker';
