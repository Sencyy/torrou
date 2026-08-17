import { VIEW_H, VIEW_W } from './config';
import type { Character } from './characters';
import type { Difficulty } from './types';

function backdrop(ctx: CanvasRenderingContext2D, t: number): void {
	const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
	g.addColorStop(0, '#0a0a1e');
	g.addColorStop(1, '#1a1030');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	for (let i = 0; i < 40; i++) {
		const x = (i * 53 + t * 0.2) % VIEW_W;
		const y = (i * 91) % VIEW_H;
		const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.02 + i));
		ctx.fillStyle = `rgba(255,255,255,${tw * 0.5})`;
		ctx.fillRect(x, y, 1.5, 1.5);
	}
}

export function drawTitle(ctx: CanvasRenderingContext2D, t: number, hiScore: number): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';

	ctx.fillStyle = '#ffe8c0';
	ctx.font = 'bold 34px monospace';
	const glow = 0.6 + 0.4 * Math.sin(t * 0.05);
	ctx.shadowColor = `rgba(255, 200, 120, ${glow})`;
	ctx.shadowBlur = 20;
	ctx.fillText('2hugame', VIEW_W / 2, 150);
	ctx.shadowBlur = 0;

	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.font = '11px monospace';
	ctx.fillText('a touhou 15-inspired danmaku', VIEW_W / 2, 180);

	ctx.fillStyle = '#bfe8ff';
	ctx.font = '10px monospace';
	ctx.fillText('Sea  →  Cave  →  Moon Palace', VIEW_W / 2, 220);

	if (hiScore > 0) {
		ctx.fillStyle = '#ffe080';
		ctx.font = '11px monospace';
		ctx.fillText(`HI-SCORE  ${hiScore}`, VIEW_W / 2, 250);
	}

	if (Math.floor(t / 40) % 2 === 0) {
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 13px monospace';
		ctx.fillText('PRESS ENTER', VIEW_W / 2, 320);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.font = '9px monospace';
	ctx.fillText('MOVE: WASD/Arrows   SHOOT: Z/Space', VIEW_W / 2, 400);
	ctx.fillText('FOCUS: Shift   BOMB: X   SWAP: C', VIEW_W / 2, 414);
	ctx.fillText('PAUSE: Esc   MUTE: M', VIEW_W / 2, 428);
	ctx.restore();
}

export function drawCharSelect(
	ctx: CanvasRenderingContext2D,
	chars: Character[],
	index: number,
	t: number,
): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';
	ctx.fillStyle = '#ffe8c0';
	ctx.font = 'bold 18px monospace';
	ctx.fillText('SELECT CHARACTER', VIEW_W / 2, 60);

	const bw = 80;
	const gap = 16;
	const total = chars.length * bw + (chars.length - 1) * gap;
	const x0 = (VIEW_W - total) / 2;

	for (let i = 0; i < chars.length; i++) {
		const c = chars[i];
		const x = x0 + i * (bw + gap);
		const y = 140;
		const sel = i === index;
		ctx.fillStyle = sel ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)';
		ctx.fillRect(x, y, bw, 150);
		ctx.strokeStyle = sel ? '#ffe8c0' : 'rgba(255,255,255,0.2)';
		ctx.lineWidth = sel ? 2 : 1;
		ctx.strokeRect(x, y, bw, 150);

		// Preview ship
		ctx.save();
		ctx.translate(x + bw / 2, y + 55);
		ctx.scale(2.2, 2.2);
		ctx.fillStyle = c.accent;
		ctx.beginPath();
		ctx.moveTo(-3, -2);
		ctx.lineTo(-12, 2);
		ctx.lineTo(-4, 4);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(3, -2);
		ctx.lineTo(12, 2);
		ctx.lineTo(4, 4);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = c.color;
		ctx.beginPath();
		ctx.moveTo(0, -9);
		ctx.lineTo(5, 6);
		ctx.lineTo(0, 3);
		ctx.lineTo(-5, 6);
		ctx.closePath();
		ctx.fill();
		ctx.restore();

		ctx.fillStyle = c.color;
		ctx.font = 'bold 13px monospace';
		ctx.fillText(c.name, x + bw / 2, y + 110);
		ctx.fillStyle = 'rgba(255,255,255,0.6)';
		ctx.font = '8px monospace';
		ctx.fillText(c.title, x + bw / 2, y + 126);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.font = '10px monospace';
	ctx.fillText('←/→  or  A/D to choose', VIEW_W / 2, 340);
	if (Math.floor(t / 40) % 2 === 0) {
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 12px monospace';
		ctx.fillText('ENTER to confirm', VIEW_W / 2, 370);
	}
	ctx.fillStyle = 'rgba(255,255,255,0.4)';
	ctx.font = '9px monospace';
	ctx.fillText('ESC to go back', VIEW_W / 2, 400);
	ctx.restore();
}

export function drawDiffSelect(
	ctx: CanvasRenderingContext2D,
	diffs: Difficulty[],
	index: number,
	t: number,
): void {
	backdrop(ctx, t);
	ctx.save();
	ctx.textAlign = 'center';
	ctx.fillStyle = '#ffe8c0';
	ctx.font = 'bold 18px monospace';
	ctx.fillText('SELECT DIFFICULTY', VIEW_W / 2, 80);

	for (let i = 0; i < diffs.length; i++) {
		const y = 140 + i * 44;
		const sel = i === index;
		ctx.fillStyle = sel ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)';
		ctx.fillRect(60, y, VIEW_W - 120, 34);
		ctx.strokeStyle = sel ? '#ffe8c0' : 'rgba(255,255,255,0.2)';
		ctx.lineWidth = sel ? 2 : 1;
		ctx.strokeRect(60, y, VIEW_W - 120, 34);
		ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.6)';
		ctx.font = sel ? 'bold 14px monospace' : '13px monospace';
		ctx.fillText(diffs[i].label, VIEW_W / 2, y + 10);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.font = '10px monospace';
	ctx.fillText('↑/↓ or W/S to choose', VIEW_W / 2, 360);
	if (Math.floor(t / 40) % 2 === 0) {
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 12px monospace';
		ctx.fillText('ENTER to start', VIEW_W / 2, 390);
	}
	ctx.fillStyle = 'rgba(255,255,255,0.4)';
	ctx.font = '9px monospace';
	ctx.fillText('ESC to go back', VIEW_W / 2, 420);
	ctx.restore();
}

export function drawPause(ctx: CanvasRenderingContext2D): void {
	ctx.save();
	ctx.fillStyle = 'rgba(0,0,0,0.6)';
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	ctx.textAlign = 'center';
	ctx.fillStyle = '#fff';
	ctx.font = 'bold 22px monospace';
	ctx.fillText('PAUSED', VIEW_W / 2, 200);
	ctx.font = '11px monospace';
	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.fillText('ESC / ENTER to resume', VIEW_W / 2, 240);
	ctx.fillText('B to quit to title', VIEW_W / 2, 260);
	ctx.restore();
}

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
	ctx.fillStyle = titleColor;
	ctx.font = 'bold 26px monospace';
	ctx.fillText(title, VIEW_W / 2, 140);

	ctx.fillStyle = '#fff';
	ctx.font = '13px monospace';
	ctx.fillText(`SCORE  ${score}`, VIEW_W / 2, 210);
	ctx.fillText(`RANK  ${rank}`, VIEW_W / 2, 235);

	if (newHigh) {
		ctx.fillStyle = '#ffe080';
		ctx.font = 'bold 14px monospace';
		const blink = Math.floor(t / 30) % 2 === 0;
		if (blink) ctx.fillText('NEW HI-SCORE!', VIEW_W / 2, 270);
	} else {
		ctx.fillStyle = 'rgba(255,255,255,0.6)';
		ctx.font = '12px monospace';
		ctx.fillText(`HI  ${hiScore}`, VIEW_W / 2, 270);
	}

	if (Math.floor(t / 40) % 2 === 0) {
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 12px monospace';
		ctx.fillText('ENTER to return to title', VIEW_W / 2, 360);
	}
	ctx.restore();
}
