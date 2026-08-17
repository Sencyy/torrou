import type { StageTheme } from './types';

export type BackdropTheme = 'title' | StageTheme | 'end';

const COLORS: Record<BackdropTheme, [string, string, string]> = {
	title: ['#0b0b24', '#1a1140', '#2a1a52'],
	sea: ['#03222e', '#075064', '#0a7078'],
	cave: ['#120822', '#221040', '#33205a'],
	moon: ['#04061a', '#0a0f30', '#1a2050'],
	end: ['#100a1e', '#1e1236', '#2e1c52'],
};

const PARTICLE: Record<BackdropTheme, string> = {
	title: '255, 200, 220',
	sea: '190, 240, 255',
	cave: '200, 160, 255',
	moon: '255, 210, 225',
	end: '255, 230, 160',
};

// Deterministic pseudo-random in [0,1)
function rnd(i: number, salt: number): number {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
}

export function drawWindowBackdrop(
	ctx: CanvasRenderingContext2D,
	theme: BackdropTheme,
	w: number,
	h: number,
	t: number,
): void {
	if (w <= 0 || h <= 0) return;

	// Base gradient
	const g = ctx.createLinearGradient(0, 0, 0, h);
	const c = COLORS[theme];
	g.addColorStop(0, c[0]);
	g.addColorStop(0.55, c[1]);
	g.addColorStop(1, c[2]);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);

	// Drifting particles (petals for night scenes, bubbles for sea, dust for cave)
	const rising = theme === 'sea';
	const petal = theme === 'title' || theme === 'moon' || theme === 'end';
	const n = 28;
	for (let i = 0; i < n; i++) {
		const speed = 0.15 + rnd(i, 1) * 0.5;
		const x = ((rnd(i, 2) * (w + 40) + t * speed) % (w + 40)) - 20;
		const drift = Math.sin(t * 0.01 + i * 1.3) * 14;
		const yRaw =
			rising ?
				((rnd(i, 3) * (h + 40) - t * speed) % (h + 40) + (h + 40)) % (h + 40) - 20
			:
				((rnd(i, 3) * (h + 40) + t * speed) % (h + 40)) - 20;
		const y = yRaw + drift;
		const s = 1 + rnd(i, 4) * 2.2;
		const tw = 0.2 + 0.5 * Math.abs(Math.sin(t * 0.02 + i * 1.7));
		ctx.fillStyle = `rgba(${PARTICLE[theme]}, ${tw})`;
		if (petal) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(t * 0.02 + i);
			ctx.beginPath();
			ctx.ellipse(0, 0, s * 1.7, s * 0.8, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		} else {
			ctx.beginPath();
			ctx.arc(x, y, s, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	// Vignette
	const v = ctx.createRadialGradient(
		w / 2,
		h / 2,
		Math.min(w, h) * 0.35,
		w / 2,
		h / 2,
		Math.max(w, h) * 0.72,
	);
	v.addColorStop(0, 'rgba(0,0,0,0)');
	v.addColorStop(1, 'rgba(0,0,0,0.55)');
	ctx.fillStyle = v;
	ctx.fillRect(0, 0, w, h);
}
