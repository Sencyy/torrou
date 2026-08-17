import type { Bullet } from './bullet';
import type { Character } from './characters';
import type { Enemy } from './enemy';
import type { Boss } from './boss';
import type { Item } from './item';
import type { ItemType } from './types';
import { glowCircle, hexA, sparkle, starPath } from './gfx';

// ---------- character sprites (chibi anime style, origin at hitbox) ----------

function drawAya(ctx: CanvasRenderingContext2D, t: number): void {
	const flap = Math.sin(t * 0.5);

	// Feather wings (white, 3 plumes per side)
	ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
	for (let s = -1; s <= 1; s += 2) {
		for (let i = 0; i < 3; i++) {
			ctx.save();
			ctx.translate(s * 3.5, -1);
			ctx.rotate(s * (0.85 + i * 0.38 + flap * 0.22));
			ctx.beginPath();
			ctx.ellipse(0, -5, 2.2, 5.5, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}

	// Long ribbon (michihiki) streaming behind
	ctx.strokeStyle = '#e03050';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(-2, -7);
	ctx.quadraticCurveTo(-9, -3 + flap * 2, -13, 5 + flap * 3);
	ctx.stroke();

	// Dress
	ctx.fillStyle = '#f0f4ff';
	ctx.beginPath();
	ctx.moveTo(0, -3);
	ctx.quadraticCurveTo(6, 2, 5.5, 8);
	ctx.lineTo(-5.5, 8);
	ctx.quadraticCurveTo(-6, 2, 0, -3);
	ctx.closePath();
	ctx.fill();
	// Sash
	ctx.fillStyle = '#e03050';
	ctx.fillRect(-4.5, 1.5, 9, 2);

	// Head
	ctx.fillStyle = '#ffe8d8';
	ctx.beginPath();
	ctx.arc(0, -6.5, 4.2, 0, Math.PI * 2);
	ctx.fill();

	// White hair (top cap + side locks)
	const sway = Math.sin(t * 0.2) * 0.6;
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(0, -7.2, 4.5, Math.PI * 0.98, Math.PI * 2.02);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-4.3, -7);
	ctx.quadraticCurveTo(-6.5, -3, -4.8 + sway, 1);
	ctx.lineTo(-3, -2);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(4.3, -7);
	ctx.quadraticCurveTo(6.5, -3, 4.8 - sway, 1);
	ctx.lineTo(3, -2);
	ctx.closePath();
	ctx.fill();

	// Tengu hat band
	ctx.fillStyle = '#e03050';
	ctx.fillRect(-4.2, -9.6, 8.4, 2.4);

	// Eyes
	ctx.fillStyle = '#2a4a7a';
	ctx.fillRect(-2.2, -6.3, 1.3, 1.9);
	ctx.fillRect(0.9, -6.3, 1.3, 1.9);
}

function drawSuika(ctx: CanvasRenderingContext2D, t: number): void {
	const flap = Math.sin(t * 0.45) * 1.5;

	// Pink translucent wings
	ctx.fillStyle = 'rgba(255, 170, 205, 0.8)';
	ctx.beginPath();
	ctx.ellipse(-5.5, -1 + flap * 0.3, 5, 2.4, -0.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(5.5, -1 - flap * 0.3, 5, 2.4, 0.5, 0, Math.PI * 2);
	ctx.fill();

	// Dress (pink)
	ctx.fillStyle = '#ff9ec0';
	ctx.beginPath();
	ctx.moveTo(0, -3);
	ctx.quadraticCurveTo(6.5, 2, 6, 8.5);
	ctx.lineTo(-6, 8.5);
	ctx.quadraticCurveTo(-6.5, 2, 0, -3);
	ctx.closePath();
	ctx.fill();
	// Sash
	ctx.fillStyle = '#e0508a';
	ctx.fillRect(-5, 1.5, 10, 2);

	// Head
	ctx.fillStyle = '#ffe8d8';
	ctx.beginPath();
	ctx.arc(0, -6.5, 4.4, 0, Math.PI * 2);
	ctx.fill();

	// Green watermelon hair
	const sway = Math.sin(t * 0.2) * 0.6;
	ctx.fillStyle = '#40c878';
	ctx.beginPath();
	ctx.arc(0, -7.2, 4.8, Math.PI * 0.98, Math.PI * 2.02);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-4.6, -7);
	ctx.quadraticCurveTo(-7, -2, -5 + sway, 2);
	ctx.lineTo(-3, -2);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(4.6, -7);
	ctx.quadraticCurveTo(7, -2, 5 - sway, 2);
	ctx.lineTo(3, -2);
	ctx.closePath();
	ctx.fill();
	// Watermelon stripes
	ctx.strokeStyle = '#1e8a4c';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(-1.5, -11.8);
	ctx.quadraticCurveTo(-2, -9, -1.2, -6.5);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(1.5, -11.8);
	ctx.quadraticCurveTo(2, -9, 1.2, -6.5);
	ctx.stroke();

	// Horns
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.moveTo(-3.2, -10.5);
	ctx.lineTo(-4.2, -13.5);
	ctx.lineTo(-1.6, -11);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(3.2, -10.5);
	ctx.lineTo(4.2, -13.5);
	ctx.lineTo(1.6, -11);
	ctx.closePath();
	ctx.fill();

	// Big eyes
	ctx.fillStyle = '#3a2a5a';
	ctx.fillRect(-2.4, -6.6, 1.6, 2.1);
	ctx.fillRect(0.8, -6.6, 1.6, 2.1);
	ctx.fillStyle = '#fff';
	ctx.fillRect(-2.2, -6.4, 0.6, 0.6);
	ctx.fillRect(1.0, -6.4, 0.6, 0.6);
}

function drawMarisa(ctx: CanvasRenderingContext2D, t: number): void {
	const flap = Math.sin(t * 0.5) * 1.5;

	// Flapping cape (blue)
	ctx.fillStyle = 'rgba(90, 120, 220, 0.85)';
	ctx.beginPath();
	ctx.moveTo(-3.5, -4);
	ctx.quadraticCurveTo(-9 - flap, 2, -7, 9);
	ctx.lineTo(-2, 6);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(3.5, -4);
	ctx.quadraticCurveTo(9 + flap, 2, 7, 9);
	ctx.lineTo(2, 6);
	ctx.closePath();
	ctx.fill();

	// Dress (blue)
	ctx.fillStyle = '#3a5ac8';
	ctx.beginPath();
	ctx.moveTo(0, -3);
	ctx.quadraticCurveTo(6, 2, 5.5, 8);
	ctx.lineTo(-5.5, 8);
	ctx.quadraticCurveTo(-6, 2, 0, -3);
	ctx.closePath();
	ctx.fill();
	// Belt
	ctx.fillStyle = '#ffe080';
	ctx.fillRect(-4, 1.5, 8, 1.6);

	// Head
	ctx.fillStyle = '#ffe8d8';
	ctx.beginPath();
	ctx.arc(0, -6.5, 4.2, 0, Math.PI * 2);
	ctx.fill();

	// Black hair
	const sway = Math.sin(t * 0.2) * 0.6;
	ctx.fillStyle = '#2a2a3a';
	ctx.beginPath();
	ctx.arc(0, -7.2, 4.5, Math.PI * 0.98, Math.PI * 2.02);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-4.3, -7);
	ctx.quadraticCurveTo(-6.5, -2, -4.8 + sway, 2);
	ctx.lineTo(-3, -2);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(4.3, -7);
	ctx.quadraticCurveTo(6.5, -2, 4.8 - sway, 2);
	ctx.lineTo(3, -2);
	ctx.closePath();
	ctx.fill();

	// Orange witch hat
	ctx.fillStyle = '#ff8c1a';
	ctx.beginPath();
	ctx.ellipse(0, -9, 7, 2, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-4, -9.5);
	ctx.quadraticCurveTo(-1, -17, 4.5, -10);
	ctx.closePath();
	ctx.fill();
	// Star on the hat
	ctx.fillStyle = '#fff';
	starPath(ctx, 0.5, -12.5, 1.8, 5, t * 0.05);
	ctx.fill();

	// Eyes
	ctx.fillStyle = '#2a2a5a';
	ctx.fillRect(-2.2, -6.3, 1.3, 1.9);
	ctx.fillRect(0.9, -6.3, 1.3, 1.9);
}

export function drawPlayer(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	char: Character,
	focusing: boolean,
	blink: boolean,
	t: number,
): void {
	if (blink && Math.floor(t / 4) % 2 === 0) return;
	ctx.save();
	ctx.translate(x, y);

	// Focus aura
	if (focusing) {
		ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(0, 0, 11 + Math.sin(t * 0.3) * 1.5, 0, Math.PI * 2);
		ctx.stroke();
	}

	switch (char.id) {
		case 'suika':
			drawSuika(ctx, t);
			break;
		case 'marisa':
			drawMarisa(ctx, t);
			break;
		default:
			drawAya(ctx, t);
			break;
	}

	ctx.restore();
}

export function drawHitbox(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
	ctx.save();
	ctx.fillStyle = 'rgba(255, 80, 80, 0.9)';
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
}

export function drawFairy(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, color: string): void {
	ctx.save();
	ctx.translate(x, y);
	const flap = Math.sin(t * 0.5) * 3;

	// Glow
	glowCircle(ctx, 0, 0, 9, color, 0.55);

	// Wings
	ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
	ctx.beginPath();
	ctx.ellipse(-4, -2, 5, 2.5, -0.5 + flap * 0.05, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(4, -2, 5, 2.5, 0.5 - flap * 0.05, 0, Math.PI * 2);
	ctx.fill();

	// Body orb
	const g = ctx.createRadialGradient(-1, -1.5, 0.5, 0, 0, 3.5);
	g.addColorStop(0, '#fff');
	g.addColorStop(1, color);
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
	ctx.fill();

	// Sparkle
	sparkle(ctx, Math.sin(t * 0.1) * 6, -4 + Math.cos(t * 0.13) * 3, 1.6, '#fff', 0.6);
	ctx.restore();
}

const ITEM_STYLE: Record<ItemType, { color: string; letter: string }> = {
	power: { color: '#ff8080', letter: 'P' },
	bomb: { color: '#80c0ff', letter: 'B' },
	point: { color: '#ffe080', letter: '1' },
	fairy: { color: '#b0e0ff', letter: 'F' },
};

export function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number): void {
	const st = ITEM_STYLE[it.type];
	const bob = Math.sin(t * 0.15 + it.x) * 1.5;
	ctx.save();
	ctx.translate(it.x, it.y + bob);
	glowCircle(ctx, 0, 0, 9, st.color, 0.4);
	ctx.fillStyle = st.color;
	ctx.beginPath();
	ctx.arc(0, 0, 6, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.fillStyle = '#fff';
	ctx.font = 'bold 8px monospace';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(st.letter, 0, 0.5);
	ctx.restore();
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
	ctx.save();
	ctx.translate(e.x, e.y);
	const big = e.kind === 'midboss';
	const r = big ? 14 : 7;
	const flap = Math.sin(t * 0.4 + e.x) * (big ? 3 : 1.5);

	// Glow
	glowCircle(ctx, 0, 0, r + 6, e.color, 0.4);

	// Wings
	ctx.fillStyle = hexA(e.color, 0.5);
	ctx.beginPath();
	ctx.ellipse(-r * 0.95, -1 + flap * 0.3, r * 0.8, r * 0.35, -0.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(r * 0.95, -1 - flap * 0.3, r * 0.8, r * 0.35, 0.5, 0, Math.PI * 2);
	ctx.fill();

	// Body (teardrop)
	ctx.fillStyle = e.color;
	ctx.beginPath();
	ctx.moveTo(0, -r);
	ctx.quadraticCurveTo(r, -r * 0.2, r * 0.7, r * 0.5);
	ctx.quadraticCurveTo(0, r * 1.1, -r * 0.7, r * 0.5);
	ctx.quadraticCurveTo(-r, -r * 0.2, 0, -r);
	ctx.closePath();
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
	ctx.lineWidth = 1;
	ctx.stroke();

	// Eyes
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(-r * 0.3, -r * 0.15, big ? 2.6 : 1.5, 0, Math.PI * 2);
	ctx.arc(r * 0.3, -r * 0.15, big ? 2.6 : 1.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#20204a';
	ctx.beginPath();
	ctx.arc(-r * 0.3, -r * 0.1, big ? 1.3 : 0.8, 0, Math.PI * 2);
	ctx.arc(r * 0.3, -r * 0.1, big ? 1.3 : 0.8, 0, Math.PI * 2);
	ctx.fill();

	if (big) {
		// HP bar
		const w = 30;
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(-w / 2, -r - 8, w, 3);
		ctx.fillStyle = '#ff6060';
		ctx.fillRect(-w / 2, -r - 8, (w * e.hp) / e.maxHp, 3);
	}
	ctx.restore();
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, t: number): void {
	if (!boss.active) return;
	ctx.save();
	ctx.translate(boss.x, boss.y);
	const color = boss.def?.color ?? '#fff';
	const pulse = 1 + Math.sin(t * 0.08) * 0.06;
	const sway = Math.sin(t * 0.03) * 2;

	// Aura
	glowCircle(ctx, 0, 0, 64 * pulse, color, 0.55);

	// Outer ring with orbiting sparkles
	ctx.strokeStyle = hexA(color, 0.7);
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(0, 0, 30 * pulse, 0, Math.PI * 2);
	ctx.stroke();
	for (let i = 0; i < 8; i++) {
		const a = t * 0.04 + (i / 8) * Math.PI * 2;
		sparkle(ctx, Math.cos(a) * 30 * pulse, Math.sin(a) * 30 * pulse, 2.5, '#fff', 0.8);
	}

	// Flowing dress
	ctx.fillStyle = hexA(color, 0.9);
	ctx.beginPath();
	ctx.moveTo(-8, -6);
	ctx.quadraticCurveTo(-24 + sway, 10, -18 + sway, 26);
	ctx.quadraticCurveTo(0, 32, 18 - sway, 26);
	ctx.quadraticCurveTo(24 - sway, 10, 8, -6);
	ctx.closePath();
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	ctx.lineWidth = 1;
	ctx.stroke();

	// Long hair flowing behind
	ctx.fillStyle = hexA(color, 0.75);
	ctx.beginPath();
	ctx.moveTo(-7, -14);
	ctx.quadraticCurveTo(-16 + sway, -4, -12 + sway, 12);
	ctx.lineTo(-6, 2);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(7, -14);
	ctx.quadraticCurveTo(16 - sway, -4, 12 - sway, 12);
	ctx.lineTo(6, 2);
	ctx.closePath();
	ctx.fill();

	// Torso
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(-5, -6);
	ctx.lineTo(5, -6);
	ctx.lineTo(3, 4);
	ctx.lineTo(-3, 4);
	ctx.closePath();
	ctx.fill();

	// Head
	ctx.fillStyle = '#ffe8d8';
	ctx.beginPath();
	ctx.arc(0, -12, 7, 0, Math.PI * 2);
	ctx.fill();
	// Hair cap
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(0, -13, 7.4, Math.PI, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
	// Eyes
	ctx.fillStyle = '#30305a';
	ctx.fillRect(-3.4, -12.5, 1.8, 2.6);
	ctx.fillRect(1.6, -12.5, 1.8, 2.6);
	ctx.fillStyle = '#fff';
	ctx.fillRect(-3.2, -12.3, 0.7, 0.7);
	ctx.fillRect(1.8, -12.3, 0.7, 0.7);
	// Forehead glow
	glowCircle(ctx, 0, -16, 3, '#fff', 0.9);

	// Rotating petals
	for (let i = 0; i < 6; i++) {
		const a = t * 0.03 + (i / 6) * Math.PI * 2;
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.beginPath();
		ctx.ellipse(Math.cos(a) * 16, Math.sin(a) * 16, 6, 3, a, 0, Math.PI * 2);
		ctx.fill();
	}

	// Core
	glowCircle(ctx, 0, 0, 9, '#fff', 0.9);
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, 4, 0, Math.PI * 2);
	ctx.fill();

	// HP bar
	if (boss.phase !== 'enter') {
		const w = 80;
		ctx.fillStyle = 'rgba(0,0,0,0.6)';
		ctx.fillRect(-w / 2, 34, w, 5);
		ctx.fillStyle = '#ff60a0';
		ctx.fillRect(-w / 2, 34, (w * boss.hp) / boss.maxHp, 5);
	}
	ctx.restore();
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet): void {
	const sp = Math.hypot(b.vx, b.vy);

	// Velocity streak
	if (sp > 3) {
		const k = Math.min(6, sp * 0.8);
		ctx.strokeStyle = hexA(b.color, 0.45);
		ctx.lineWidth = b.r * 0.7;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(b.x - b.vx * k, b.y - b.vy * k);
		ctx.lineTo(b.x, b.y);
		ctx.stroke();
	}

	// Glow
	ctx.fillStyle = hexA(b.color, 0.45);
	ctx.beginPath();
	ctx.arc(b.x, b.y, b.r + 2, 0, Math.PI * 2);
	ctx.fill();

	// Core
	ctx.fillStyle = b.core;
	ctx.beginPath();
	ctx.arc(b.x, b.y, b.r * 0.75, 0, Math.PI * 2);
	ctx.fill();

	// Big bullets get a star sparkle
	if (b.r >= 4) {
		sparkle(ctx, b.x, b.y, b.r * 1.4, b.color, 0.5);
	}
}
