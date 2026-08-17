import type { Bullet } from './bullet';
import type { Character } from './characters';
import type { Enemy } from './enemy';
import type { Boss } from './boss';
import type { Item } from './item';
import type { ItemType } from './types';

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
		ctx.arc(0, 0, 10 + Math.sin(t * 0.3) * 1.5, 0, Math.PI * 2);
		ctx.stroke();
	}

	// Wings
	ctx.fillStyle = char.accent;
	const flap = Math.sin(t * 0.4) * 2;
	ctx.beginPath();
	ctx.moveTo(-3, -2);
	ctx.lineTo(-12, 2 + flap);
	ctx.lineTo(-4, 4);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(3, -2);
	ctx.lineTo(12, 2 + flap);
	ctx.lineTo(4, 4);
	ctx.closePath();
	ctx.fill();

	// Body
	ctx.fillStyle = char.color;
	ctx.beginPath();
	ctx.moveTo(0, -9);
	ctx.lineTo(5, 6);
	ctx.lineTo(0, 3);
	ctx.lineTo(-5, 6);
	ctx.closePath();
	ctx.fill();

	// Cockpit
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, -2, 1.6, 0, Math.PI * 2);
	ctx.fill();

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
	// Wings
	ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	ctx.beginPath();
	ctx.ellipse(-4, -2, 5, 2.5, -0.5 + flap * 0.05, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(4, -2, 5, 2.5, 0.5 - flap * 0.05, 0, Math.PI * 2);
	ctx.fill();
	// Body
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, -1, 1.4, 0, Math.PI * 2);
	ctx.fill();
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
	// Glow
	ctx.fillStyle = hexA(e.color, 0.35);
	ctx.beginPath();
	ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
	ctx.fill();
	// Body diamond
	ctx.fillStyle = e.color;
	ctx.beginPath();
	ctx.moveTo(0, -r);
	ctx.lineTo(r, 0);
	ctx.lineTo(0, r);
	ctx.lineTo(-r, 0);
	ctx.closePath();
	ctx.fill();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1;
	ctx.stroke();
	// Core
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, big ? 4 : 2, 0, Math.PI * 2);
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
	void t;
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, t: number): void {
	if (!boss.active) return;
	ctx.save();
	ctx.translate(boss.x, boss.y);
	const pulse = 1 + Math.sin(t * 0.08) * 0.06;

	// Aura
	const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 60 * pulse);
	g.addColorStop(0, hexA(boss.def?.color ?? '#fff', 0.5));
	g.addColorStop(1, hexA(boss.def?.color ?? '#fff', 0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, 60 * pulse, 0, Math.PI * 2);
	ctx.fill();

	// Outer ring
	ctx.strokeStyle = hexA(boss.def?.color ?? '#fff', 0.8);
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
	ctx.stroke();

	// Body
	ctx.fillStyle = boss.def?.color ?? '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, 20, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1.5;
	ctx.stroke();

	// Inner rotating petals
	for (let i = 0; i < 6; i++) {
		const a = t * 0.03 + (i / 6) * Math.PI * 2;
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.beginPath();
		ctx.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 6, 3, a, 0, Math.PI * 2);
		ctx.fill();
	}

	// Core
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, 6, 0, Math.PI * 2);
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
	// Glow
	ctx.fillStyle = hexA(b.color, 0.4);
	ctx.beginPath();
	ctx.arc(b.x, b.y, b.r + 2.5, 0, Math.PI * 2);
	ctx.fill();
	// Core
	ctx.fillStyle = b.core;
	ctx.beginPath();
	ctx.arc(b.x, b.y, b.r * 0.7, 0, Math.PI * 2);
	ctx.fill();
}

function hexA(hex: string, a: number): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}
