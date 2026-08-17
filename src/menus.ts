import { VIEW_H, VIEW_W } from './config';
import { CHARACTERS } from './characters';
import type { Character } from './characters';
import { glowCircle, hexA, roundedRect, sparkle } from './gfx';
import { drawPlayer } from './render';
import type { Difficulty } from './types';

// ---------- shared backdrop ----------

function backdrop(ctx: CanvasRenderingContext2D, t: number): void {
	const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
	g.addColorStop(0, '#0a0a22');
	g.addColorStop(0.6, '#160e34');
	g.addColorStop(1, '#241448');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);

	// Stars
	for (let i = 0; i < 46; i++) {
		const x = (i * 53 + t * 0.15) % VIEW_W;
		const y = (i * 91) % VIEW_H;
		const tw = 0.25 + 0.6 * Math.abs(Math.sin(t * 0.02 + i * 1.3));
		ctx.fillStyle = `rgba(255, 255, 255, ${tw * 0.6})`;
		ctx.fillRect(x, y, 1.5, 1.5);
		if (i % 9 === 0) sparkle(ctx, x, y, 3, '#fff', tw * 0.5);
	}

	// Drifting cherry petals
	for (let i = 0; i < 16; i++) {
		const px = ((i * 47 + t * 0.4) % (VIEW_W + 20)) - 10;
		const py = ((i * 83 + t * 0.7) % (VIEW_H + 20)) - 10;
		ctx.save();
		ctx.translate(px, py);
		ctx.rotate(t * 0.02 + i);
		ctx.fillStyle = 'rgba(255, 195, 215, 0.4)';
		ctx.beginPath();
		ctx.ellipse(0, 0, 3, 1.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}

function drawPortrait(
	ctx: CanvasRenderingContext2D,
	char: Character,
	cx: number,
	cy: number,
	scale: number,
	t: number,
	focusing = false,
): void {
	ctx.save();
	ctx.translate(cx, cy);
	ctx.scale(scale, scale);
	drawPlayer(ctx, 0, 0, char, focusing, false, t);
	ctx.restore();
}

function glowText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	color: string,
	font: string,
	glow: number,
): void {
	ctx.font = font;
	ctx.shadowColor = color;
	ctx.shadowBlur = glow;
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.shadowBlur = 0;
}

// ---------- title ----------

export function drawTitle(ctx: CanvasRenderingContext2D, t: number, hiScore: number): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';

	// Title with warm gradient + glow
	const tg = ctx.createLinearGradient(0, 118, 0, 158);
	tg.addColorStop(0, '#fff2d0');
	tg.addColorStop(0.55, '#ffcf90');
	tg.addColorStop(1, '#ff9ec0');
	const glow = 0.5 + 0.5 * Math.sin(t * 0.05);
	ctx.font = 'bold 36px monospace';
	ctx.shadowColor = `rgba(255, 190, 120, ${0.5 + glow * 0.5})`;
	ctx.shadowBlur = 18 + glow * 10;
	ctx.fillStyle = tg;
	ctx.fillText('2hugame', VIEW_W / 2, 148);
	ctx.shadowBlur = 0;
	// Sparkles around the title
	sparkle(ctx, 62 + Math.sin(t * 0.07) * 6, 128, 3, '#fff', 0.5 + glow * 0.4);
	sparkle(ctx, 258 + Math.cos(t * 0.06) * 6, 132, 2.4, '#fff', 0.45 + glow * 0.35);

	ctx.fillStyle = 'rgba(255,255,255,0.75)';
	ctx.font = '11px monospace';
	ctx.fillText('a touhou 15-inspired danmaku', VIEW_W / 2, 176);

	ctx.fillStyle = '#bfe8ff';
	ctx.font = '10px monospace';
	ctx.fillText('Sea  →  Cave  →  Moon Palace', VIEW_W / 2, 202);

	if (hiScore > 0) {
		ctx.fillStyle = '#ffe080';
		ctx.font = '11px monospace';
		ctx.fillText(`HI-SCORE  ${hiScore}`, VIEW_W / 2, 226);
	}

	// Character row
	for (let i = 0; i < CHARACTERS.length; i++) {
		const cx = VIEW_W / 2 + (i - 1) * 92;
		glowCircle(ctx, cx, 292, 34, CHARACTERS[i].color, 0.14);
		drawPortrait(ctx, CHARACTERS[i], cx, 292, 3, t);
	}

	if (Math.floor(t / 40) % 2 === 0) {
		glowText(ctx, 'PRESS ENTER', VIEW_W / 2, 372, '#fff', 'bold 13px monospace', 10);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.font = '9px monospace';
	ctx.fillText('MOVE: WASD/Arrows   SHOOT: Z/Space', VIEW_W / 2, 408);
	ctx.fillText('FOCUS: Shift   BOMB: X   SWAP: C', VIEW_W / 2, 422);
	ctx.fillText('PAUSE: Esc   MUTE: M', VIEW_W / 2, 436);
	ctx.restore();
}

// ---------- character select ----------

export function drawCharSelect(
	ctx: CanvasRenderingContext2D,
	chars: Character[],
	index: number,
	t: number,
): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';
	glowText(ctx, 'SELECT CHARACTER', VIEW_W / 2, 56, '#ffe8c0', 'bold 18px monospace', 8 + 4 * Math.sin(t * 0.06));

	const bw = 88;
	const bh = 186;
	const gap = 14;
	const total = chars.length * bw + (chars.length - 1) * gap;
	const x0 = (VIEW_W - total) / 2;
	const y0 = 118;

	for (let i = 0; i < chars.length; i++) {
		const c = chars[i];
		const x = x0 + i * (bw + gap);
		const sel = i === index;

		// Panel
		if (sel) glowCircle(ctx, x + bw / 2, y0 + bh / 2, bw * 0.75, c.color, 0.22);
		roundedRect(ctx, x, y0, bw, bh, 10);
		ctx.fillStyle = sel ? 'rgba(255, 235, 200, 0.12)' : 'rgba(8, 6, 20, 0.55)';
		ctx.fill();
		ctx.strokeStyle = sel ? hexA(c.color, 0.95) : 'rgba(255, 255, 255, 0.18)';
		ctx.lineWidth = sel ? 2 : 1;
		ctx.stroke();

		// Portrait
		drawPortrait(ctx, c, x + bw / 2, y0 + 74, 3.6, t, sel);

		// Name + title
		ctx.fillStyle = sel ? '#fff' : c.color;
		ctx.font = 'bold 13px monospace';
		ctx.fillText(c.name, x + bw / 2, y0 + 140);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
		ctx.font = '8px monospace';
		ctx.fillText(c.title, x + bw / 2, y0 + 156);

		if (sel) {
			// Selection chevron
			const cy = y0 + bh + 12 + Math.sin(t * 0.15) * 2;
			ctx.fillStyle = '#ffe8c0';
			ctx.beginPath();
			ctx.moveTo(x + bw / 2 - 5, cy - 4);
			ctx.lineTo(x + bw / 2 + 5, cy - 4);
			ctx.lineTo(x + bw / 2, cy + 3);
			ctx.closePath();
			ctx.fill();
		}
	}

	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.font = '10px monospace';
	ctx.fillText('←/→  or  A/D to choose', VIEW_W / 2, 352);
	if (Math.floor(t / 40) % 2 === 0) {
		glowText(ctx, 'ENTER to confirm', VIEW_W / 2, 382, '#fff', 'bold 12px monospace', 8);
	}
	ctx.fillStyle = 'rgba(255,255,255,0.4)';
	ctx.font = '9px monospace';
	ctx.fillText('ESC to go back', VIEW_W / 2, 412);
	ctx.restore();
}

// ---------- difficulty select ----------

const DIFF_COLORS = ['#7ad07a', '#7ab8ff', '#ffb060', '#ff7a90'];

export function drawDiffSelect(
	ctx: CanvasRenderingContext2D,
	diffs: Difficulty[],
	index: number,
	t: number,
): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';
	glowText(ctx, 'SELECT DIFFICULTY', VIEW_W / 2, 76, '#ffe8c0', 'bold 18px monospace', 8 + 4 * Math.sin(t * 0.06));

	for (let i = 0; i < diffs.length; i++) {
		const y = 128 + i * 52;
		const sel = i === index;
		const color = DIFF_COLORS[i % DIFF_COLORS.length];

		if (sel) glowCircle(ctx, VIEW_W / 2, y + 19, 130, color, 0.16);
		roundedRect(ctx, 56, y, VIEW_W - 112, 38, 9);
		ctx.fillStyle = sel ? hexA(color, 0.16) : 'rgba(8, 6, 20, 0.5)';
		ctx.fill();
		ctx.strokeStyle = sel ? hexA(color, 0.95) : 'rgba(255, 255, 255, 0.16)';
		ctx.lineWidth = sel ? 2 : 1;
		ctx.stroke();
		// Accent bar
		ctx.fillStyle = hexA(color, sel ? 0.95 : 0.4);
		roundedRect(ctx, 62, y + 8, 4, 22, 2);
		ctx.fill();

		ctx.fillStyle = sel ? '#fff' : 'rgba(255, 255, 255, 0.65)';
		ctx.font = sel ? 'bold 14px monospace' : '13px monospace';
		ctx.fillText(diffs[i].label, VIEW_W / 2, y + 12);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.font = '10px monospace';
	ctx.fillText('↑/↓ or W/S to choose', VIEW_W / 2, 356);
	if (Math.floor(t / 40) % 2 === 0) {
		glowText(ctx, 'ENTER to start', VIEW_W / 2, 386, '#fff', 'bold 12px monospace', 8);
	}
	ctx.fillStyle = 'rgba(255,255,255,0.4)';
	ctx.font = '9px monospace';
	ctx.fillText('ESC to go back', VIEW_W / 2, 416);
	ctx.restore();
}

// ---------- pause ----------

export function drawPause(ctx: CanvasRenderingContext2D): void {
	ctx.save();
	ctx.fillStyle = 'rgba(4, 4, 14, 0.66)';
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);

	roundedRect(ctx, VIEW_W / 2 - 110, 170, 220, 110, 12);
	ctx.fillStyle = 'rgba(16, 12, 34, 0.9)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 235, 200, 0.5)';
	ctx.lineWidth = 1.5;
	ctx.stroke();

	ctx.textAlign = 'center';
	glowText(ctx, 'PAUSED', VIEW_W / 2, 214, '#fff', 'bold 22px monospace', 10);
	ctx.font = '11px monospace';
	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.fillText('ESC / ENTER to resume', VIEW_W / 2, 240);
	ctx.fillText('B to quit to title', VIEW_W / 2, 260);
	ctx.restore();
}

// ---------- end screen ----------

export function drawEnd(
	ctx: CanvasRenderingContext2D,
	title: string,
	titleColor: string,
	score: number,
	rank: string,
	hiScore: number,
	newHigh: boolean,
	t: number,
): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';

	glowText(ctx, title, VIEW_W / 2, 128, titleColor, 'bold 26px monospace', 14 + 6 * Math.sin(t * 0.08));

	// Score panel
	roundedRect(ctx, VIEW_W / 2 - 110, 160, 220, 118, 12);
	ctx.fillStyle = 'rgba(10, 8, 24, 0.72)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 235, 200, 0.4)';
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.fillStyle = '#fff';
	ctx.font = '13px monospace';
	ctx.fillText(`SCORE  ${score}`, VIEW_W / 2, 196);
	ctx.fillStyle = '#bfe8ff';
	ctx.fillText(`RANK  ${rank}`, VIEW_W / 2, 222);

	if (newHigh) {
		const blink = Math.floor(t / 30) % 2 === 0;
		if (blink) glowText(ctx, 'NEW HI-SCORE!', VIEW_W / 2, 254, '#ffe080', 'bold 14px monospace', 10);
	} else {
		ctx.fillStyle = 'rgba(255,255,255,0.6)';
		ctx.font = '12px monospace';
		ctx.fillText(`HI  ${hiScore}`, VIEW_W / 2, 254);
	}

	if (Math.floor(t / 40) % 2 === 0) {
		glowText(ctx, 'ENTER to return to title', VIEW_W / 2, 340, '#fff', 'bold 12px monospace', 8);
	}
	ctx.restore();
}
