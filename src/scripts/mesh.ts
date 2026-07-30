import { pointer, addFrame, removeFrame } from './pointer';

/**
 * Background layer 4 — a single fullscreen triangle running a hand-written
 * fragment shader. No three.js, no OGL: the whole effect is one draw call, so
 * pulling in a scene graph would cost ~50–150KB to render one quad.
 *
 * The field is drawn as topographic contour lines rather than a cloud, which
 * keeps it in the same visual language as the drafting grid, and it renders at
 * ~30fps because the motion is a slow breath where extra frames buy nothing.
 */

const VERTEX = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT = `
/* The sin/fract hash below multiplies by 43758.5453, which overflows mediump's
   ~10-bit mantissa and collapses the noise to a near-constant. Desktop drivers
   often promote mediump silently; strict ones (and real phones, where mediump
   is genuinely 16-bit) do not, and the whole field disappears. */
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec3  u_ink;
uniform vec3  u_accent;
uniform float u_alpha;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = gl_FragCoord.xy / u_res;
  p.x *= aspect;

  vec2 m = u_mouse;
  m.x *= aspect;

  // The cursor deforms the field locally instead of moving the whole layer.
  float dist = distance(p, m);
  vec2 pull = (p - m) * exp(-dist * 2.2) * 0.3;

  // Domain warp keeps the contours organic rather than concentric.
  vec2 q = vec2(
    fbm(p * 1.6 + u_time * 0.10),
    fbm(p * 1.6 + vec2(3.1, 1.7) - u_time * 0.08)
  );
  float field = fbm(p * 2.1 + q * 0.9 - pull + u_time * 0.05);

  // Slice the field into contour lines.
  float bands = abs(fract(field * 5.0) - 0.5) * 2.0;
  float contour = smoothstep(0.82, 1.0, 1.0 - bands);

  // Accent is reserved for the lines closest to the cursor — the "soft light
  // follows cursor" moment, kept to a handful of pixels.
  float glow = exp(-dist * 1.9);
  vec3 color = mix(u_ink, u_accent, clamp(contour * glow * 1.7, 0.0, 1.0));

  gl_FragColor = vec4(color, contour * u_alpha * (0.75 + glow * 0.9));
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function readRgb(name: string, fallback: [number, number, number]): [number, number, number] {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	const hex = raw.replace('#', '');
	if (hex.length !== 6) return fallback;
	const value = Number.parseInt(hex, 16);
	if (Number.isNaN(value)) return fallback;
	return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

const FRAME_MS = 1000 / 30;

export function initMesh(canvas: HTMLCanvasElement): void {
	const gl = canvas.getContext('webgl', {
		alpha: true,
		antialias: false,
		depth: false,
		stencil: false,
		premultipliedAlpha: false,
		powerPreference: 'low-power',
		// Required because the render loop is throttled below the compositor's
		// frame rate: without it the browser clears the buffer after every
		// composite, so the frames we skip would composite as blank and the
		// layer would strobe at 30Hz.
		preserveDrawingBuffer: true,
	});
	if (!gl) return;

	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
	const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
	if (!vertex || !fragment) return;

	const program = gl.createProgram();
	if (!program) return;
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
	gl.useProgram(program);

	// One triangle that overshoots the viewport covers it with 3 vertices
	// instead of the 6 a quad would need.
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const attrib = gl.getAttribLocation(program, 'a_pos');
	gl.enableVertexAttribArray(attrib);
	gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

	const uRes = gl.getUniformLocation(program, 'u_res');
	const uTime = gl.getUniformLocation(program, 'u_time');
	const uMouse = gl.getUniformLocation(program, 'u_mouse');
	const uInk = gl.getUniformLocation(program, 'u_ink');
	const uAccent = gl.getUniformLocation(program, 'u_accent');
	const uAlpha = gl.getUniformLocation(program, 'u_alpha');

	gl.clearColor(0, 0, 0, 0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	// These are arrow consts rather than `function` declarations so the
	// null-check on `gl` above still narrows inside them — a hoisted function
	// could in principle run before the guard, so TypeScript will not narrow it.
	const applyTheme = (): void => {
		const dark = document.documentElement.dataset.theme === 'dark';
		const accent = readRgb('--accent', dark ? [0.43, 0.55, 1] : [0.17, 0.3, 1]);
		// Ink tracks the theme so the contours read as drawn on the surface.
		if (dark) gl.uniform3f(uInk, 0.85, 0.85, 0.88);
		else gl.uniform3f(uInk, 0.1, 0.1, 0.12);
		gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
		gl.uniform1f(uAlpha, dark ? 0.16 : 0.1);
	};

	const resize = (): void => {
		// 1.5 is the point past which extra device pixels stop being visible on
		// a field this soft, but keep costing fill rate.
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const width = Math.round(canvas.clientWidth * dpr);
		const height = Math.round(canvas.clientHeight * dpr);
		if (canvas.width === width && canvas.height === height) return;
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
		gl.uniform2f(uRes, width, height);
	};

	let elapsed = 0;
	let sinceDraw = 0;

	const frame = (delta: number): void => {
		elapsed += delta;
		sinceDraw += delta;
		if (sinceDraw < FRAME_MS) return;
		sinceDraw = 0;

		// elapsed is milliseconds; 0.06 shader-units per second is the breath.
		gl.uniform1f(uTime, (elapsed / 1000) * 0.06);
		// Flip Y: clip space counts up, the DOM counts down.
		gl.uniform2f(uMouse, pointer.x, 1 - pointer.y);
		// Explicit now that the buffer is preserved between frames — otherwise
		// each pass would blend on top of the last and saturate.
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	};

	resize();
	applyTheme();

	let running = false;
	const setRunning = (next: boolean) => {
		if (next === running) return;
		running = next;
		if (next) addFrame(frame);
		else removeFrame(frame);
	};

	// Stop rendering the moment the hero scrolls away.
	new IntersectionObserver(
		(entries) => setRunning(entries[0]?.isIntersecting ?? false),
		{ threshold: 0 },
	).observe(canvas);

	new MutationObserver(applyTheme).observe(document.documentElement, {
		attributeFilter: ['data-theme'],
	});

	let resizeTimer = 0;
	window.addEventListener('resize', () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(resize, 150);
	});

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) setRunning(false);
		else setRunning(canvas.getBoundingClientRect().top < window.innerHeight);
	});
}
