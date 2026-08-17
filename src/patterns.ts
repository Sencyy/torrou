import type { BulletPool } from './bullet';
import type { Difficulty } from './types';

export interface EmitCtx {
	pool: BulletPool;
	diff: Difficulty;
	playerX: number;
	playerY: number;
	t: number;
	rand: () => number;
}

const TAU = Math.PI * 2;

function density(count: number, diff: Difficulty): number {
	return Math.max(1, Math.round(count * diff.bulletDensity));
}

function speed(v: number, diff: Difficulty): number {
	return v * diff.bulletSpeed;
}

export function emitRing(
	ctx: EmitCtx,
	x: number,
	y: number,
	count: number,
	sp: number,
	angle0: number,
	r: number,
	color: string,
	core: string,
): void {
	const n = density(count, ctx.diff);
	const s = speed(sp, ctx.diff);
	for (let i = 0; i < n; i++) {
		const a = angle0 + (i / n) * TAU;
		ctx.pool.spawn(x, y, a, s, r, color, core);
	}
}

export function emitFan(
	ctx: EmitCtx,
	x: number,
	y: number,
	count: number,
	sp: number,
	centerAngle: number,
	spread: number,
	r: number,
	color: string,
	core: string,
): void {
	const n = density(count, ctx.diff);
	const s = speed(sp, ctx.diff);
	for (let i = 0; i < n; i++) {
		const f = n === 1 ? 0.5 : i / (n - 1);
		const a = centerAngle + (f - 0.5) * spread;
		ctx.pool.spawn(x, y, a, s, r, color, core);
	}
}

export function emitAimed(
	ctx: EmitCtx,
	x: number,
	y: number,
	count: number,
	sp: number,
	spread: number,
	r: number,
	color: string,
	core: string,
): void {
	const base = Math.atan2(ctx.playerY - y, ctx.playerX - x);
	emitFan(ctx, x, y, count, sp, base, spread, r, color, core);
}

export function emitWall(
	ctx: EmitCtx,
	y: number,
	viewW: number,
	sp: number,
	gapX: number,
	gapW: number,
	r: number,
	color: string,
	core: string,
): void {
	const spacing = 18;
	const s = speed(sp, ctx.diff);
	for (let x = spacing / 2; x < viewW; x += spacing) {
		if (Math.abs(x - gapX) < gapW / 2) continue;
		ctx.pool.spawn(x, y, Math.PI / 2, s, r, color, core);
	}
}

export function emitPetal(
	ctx: EmitCtx,
	x: number,
	y: number,
	petals: number,
	arms: number,
	sp: number,
	r: number,
	color: string,
	core: string,
): void {
	const n = density(arms, ctx.diff);
	const s = speed(sp, ctx.diff);
	for (let i = 0; i < n; i++) {
		const base = (i / n) * TAU + ctx.t * 0.05;
		for (let p = 0; p < petals; p++) {
			const a = base + (p / petals) * TAU;
			const d = 6 + p * 5;
			ctx.pool.spawn(
				x + Math.cos(a) * d,
				y + Math.sin(a) * d,
				a,
				s + p * 0.15,
				r,
				color,
				core,
			);
		}
	}
}

export function emitHoming(
	ctx: EmitCtx,
	x: number,
	y: number,
	count: number,
	sp: number,
	turn: number,
	r: number,
	color: string,
	core: string,
): void {
	const n = density(count, ctx.diff);
	const s = speed(sp, ctx.diff);
	for (let i = 0; i < n; i++) {
		const a = (i / n) * TAU + ctx.t * 0.03;
		const b = ctx.pool.spawn(x, y, a, s, r, color, core);
		if (b) {
			b.homing = turn * ctx.diff.bulletSpeed;
			b.targetX = ctx.playerX;
			b.targetY = ctx.playerY;
		}
	}
}

export function emitSpiralStep(
	ctx: EmitCtx,
	x: number,
	y: number,
	arms: number,
	sp: number,
	armAngle: number,
	r: number,
	color: string,
	core: string,
): void {
	const n = density(arms, ctx.diff);
	const s = speed(sp, ctx.diff);
	for (let i = 0; i < n; i++) {
		const a = armAngle + (i / n) * TAU;
		ctx.pool.spawn(x, y, a, s, r, color, core);
	}
}
