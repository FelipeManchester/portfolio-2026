import { addFrame, removeFrame, smooth } from './ticker';

/**
 * Plane tilt on the hero name. A single perspective + rotateX/rotateY, eased
 * toward the cursor's position across the whole viewport — the name reads as
 * one card tilting in your hand, not as individual letters reacting.
 */

const MAX_ROT_X = 7;
const MAX_ROT_Y = 3;

let el: HTMLElement | null = null;
let rotX = 0;
let rotY = 0;
let targetX = 0;
let targetY = 0;
let running = false;

function frame(delta: number): void {
  if (!el) return;

  rotX = smooth(rotX, targetX, delta, 140);
  rotY = smooth(rotY, targetY, delta, 140);

  if (Math.abs(rotX - targetX) < 0.01 && Math.abs(rotY - targetY) < 0.01) {
    rotX = targetX;
    rotY = targetY;
    removeFrame(frame);
    running = false;
  }

  el.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
}

function wake(): void {
  if (running) return;
  running = true;
  addFrame(frame);
}

export function initTilt(): void {
  // No cursor to tilt toward, and a rotating heading would only ever sit
  // crooked on a touch screen.
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  el = document.querySelector<HTMLElement>('[data-tilt]');
  if (!el) return;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

      // Normalised against the viewport, not the name's own box — the tilt
      // reads off where the cursor is on the page, so it keeps responding
      // even while sitting outside the two lines of text.
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;

      targetX = -ny * MAX_ROT_X;
      targetY = nx * MAX_ROT_Y;

      wake();
    },
    { passive: true },
  );
}
