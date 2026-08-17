import { VIEW_W } from './config';
import type { BossDef } from './boss';
import type { Enemy, EnemyConfig, EnemyPool } from './enemy';
import {
	emitAimed,
	emitFan,
	emitHoming,
	emitPetal,
	emitRing,
	emitSpiralStep,
	emitWall,
	type EmitCtx,
} from './patterns';
import type { Difficulty, StageTheme } from './types';

export interface Wave {
	at: number;
	spawn: (pool: EnemyPool, diff: Difficulty, rand: () => number) => void;
}

export interface StageDef {
	name: string;
	theme: StageTheme;
	length: number;
	waves: Wave[];
	boss: BossDef;
}

// ---- standard enemy fire patterns ----
const fireAimed1 = (ctx: EmitCtx, e: Enemy): void =>
	emitAimed(ctx, e.x, e.y, 1, 2.2, 0, 3, '#ffd0d0', '#fff');
const fireAimed3 = (ctx: EmitCtx, e: Enemy): void =>
	emitAimed(ctx, e.x, e.y, 3, 2.0, 0.5, 3, '#ffd0d0', '#fff');
const fireRing4 = (ctx: EmitCtx, e: Enemy): void =>
	emitRing(ctx, e.x, e.y, 4, 1.8, ctx.t * 0.05, 3, '#d0d0ff', '#fff');
const fireFan5 = (ctx: EmitCtx, e: Enemy): void =>
	emitFan(ctx, e.x, e.y, 5, 1.8, Math.PI / 2, 1.2, 3, '#ffe0b0', '#fff');
const fireRing8 = (ctx: EmitCtx, e: Enemy): void =>
	emitRing(ctx, e.x, e.y, 8, 1.7, ctx.t * 0.04, 3, '#9ad0ff', '#fff');

// ---- enemy config factories ----
function flyer(x: number, opts: Partial<EnemyConfig> = {}): EnemyConfig {
	return {
		hp: 2,
		kind: 'flyer',
		path: 'straight',
		x,
		speed: 1.4,
		fireEvery: 70,
		firePattern: fireAimed1,
		color: '#8fd0ff',
		score: 100,
		...opts,
	};
}

function midboss(x: number, opts: Partial<EnemyConfig> = {}): EnemyConfig {
	return {
		hp: 60,
		kind: 'midboss',
		path: 'hold',
		x,
		targetY: 120,
		speed: 1.5,
		fireEvery: 42,
		firePattern: fireRing8,
		color: '#5aa0d0',
		score: 1000,
		drop: 'power',
		...opts,
	};
}

function row(
	pool: EnemyPool,
	count: number,
	x0: number,
	spacing: number,
	cfg: EnemyConfig,
): void {
	for (let i = 0; i < count; i++) pool.spawn({ ...cfg, x: x0 + i * spacing });
}

// ================= STAGE 1 : SEA =================
const seaBoss: BossDef = {
	name: 'Sea Witch',
	title: 'Umi no Majo',
	hp: 900,
	color: '#5ac8e0',
	normal: (ctx, boss, t) => {
		if (t % 50 === 0) emitAimed(ctx, boss.x, boss.y, 3, 2.2, 0.6, 3, '#9ad0ff', '#fff');
		if (t % 120 === 60) emitRing(ctx, boss.x, boss.y, 6, 1.6, t * 0.03, 3, '#c0f0ff', '#fff');
	},
	spells: [
		{
			name: 'Tidal Ring',
			duration: 360,
			color: '#7ad0ff',
			fire: (ctx, boss, t) => {
				if (t % 12 === 0) emitRing(ctx, boss.x, boss.y, 10, 1.8, t * 0.06, 3, '#7ad0ff', '#fff');
				if (t % 60 === 30) emitAimed(ctx, boss.x, boss.y, 2, 2.4, 0.3, 3, '#bff0ff', '#fff');
			},
		},
		{
			name: 'Wave Wall',
			duration: 380,
			color: '#5ac8e0',
			fire: (ctx, boss, t) => {
				if (t % 40 === 0)
					emitWall(ctx, -10, VIEW_W, 1.8, (t * 7) % VIEW_W, 70, 3, '#8fe0ff', '#fff');
				if (t % 90 === 45) emitAimed(ctx, boss.x, boss.y, 4, 2.2, 0.8, 3, '#bff0ff', '#fff');
			},
		},
		{
			name: 'Abyssal Petal',
			duration: 420,
			color: '#a0e0ff',
			fire: (ctx, boss, t) => {
				if (t % 10 === 0) emitPetal(ctx, boss.x, boss.y, 6, 6, 1.6, 3, '#a0e0ff', '#fff');
			},
		},
	],
};

const stage1: StageDef = {
	name: 'The Sorrowful Sea',
	theme: 'sea',
	length: 900,
	waves: [
		{ at: 30, spawn: (p) => row(p, 5, 40, 55, flyer(0, { color: '#8fd0ff' })) },
		{ at: 140, spawn: (p) => row(p, 4, 60, 60, flyer(0, { path: 'sine', amp: 40, freq: 0.04, firePattern: fireFan5 })) },
		{ at: 260, spawn: (p) => row(p, 6, 30, 45, flyer(0, { speed: 1.8, firePattern: fireAimed3, color: '#ffd0d0' })) },
		{ at: 400, spawn: (p) => row(p, 5, 40, 55, flyer(0, { path: 'sine', amp: 55, freq: 0.05, firePattern: fireRing4 })) },
		{ at: 520, spawn: (p) => p.spawn(midboss(160)) },
		{ at: 700, spawn: (p) => row(p, 7, 25, 40, flyer(0, { speed: 2.0, firePattern: fireAimed3 })) },
		{ at: 820, spawn: (p) => row(p, 5, 40, 55, flyer(0, { path: 'sine', amp: 45, freq: 0.05, firePattern: fireRing4 })) },
	],
	boss: seaBoss,
};

// ================= STAGE 2 : CAVE =================
const caveBoss: BossDef = {
	name: 'Cave Demon',
	title: 'An no Oni',
	hp: 1300,
	color: '#b060e0',
	normal: (ctx, boss, t) => {
		if (t % 45 === 0) emitRing(ctx, boss.x, boss.y, 8, 1.8, t * 0.05, 3, '#d0a0ff', '#fff');
		if (t % 90 === 45) emitAimed(ctx, boss.x, boss.y, 3, 2.4, 0.5, 3, '#e0c0ff', '#fff');
	},
	spells: [
		{
			name: 'Crystal Spiral',
			duration: 400,
			color: '#c080ff',
			fire: (ctx, boss, t) => {
				if (t % 3 === 0) emitSpiralStep(ctx, boss.x, boss.y, 3, 2.0, t * 0.15, 3, '#c080ff', '#fff');
				if (t % 3 === 1) emitSpiralStep(ctx, boss.x, boss.y, 3, 2.0, -t * 0.13 + 1, 3, '#e0c0ff', '#fff');
			},
		},
		{
			name: 'Echoing Walls',
			duration: 380,
			color: '#a060d0',
			fire: (ctx, boss, t) => {
				if (t % 34 === 0) emitWall(ctx, -10, VIEW_W, 2.0, (t * 9) % VIEW_W, 60, 3, '#c090ff', '#fff');
				if (t % 100 === 50) emitHoming(ctx, boss.x, boss.y, 4, 1.8, 0.04, 4, '#e0c0ff', '#fff');
			},
		},
		{
			name: "Demon's Bloom",
			duration: 440,
			color: '#d080ff',
			fire: (ctx, boss, t) => {
				if (t % 8 === 0) emitPetal(ctx, boss.x, boss.y, 8, 7, 1.8, 3, '#d080ff', '#fff');
				if (t % 60 === 30) emitRing(ctx, boss.x, boss.y, 6, 1.5, t * 0.08, 3, '#f0d0ff', '#fff');
			},
		},
	],
};

const stage2: StageDef = {
	name: 'The Cave of the Dead',
	theme: 'cave',
	length: 960,
	waves: [
		{ at: 30, spawn: (p) => row(p, 6, 30, 45, flyer(0, { color: '#c090ff', firePattern: fireAimed3 })) },
		{ at: 150, spawn: (p) => row(p, 5, 45, 55, flyer(0, { path: 'curve', speed: 1.6, firePattern: fireRing4 })) },
		{ at: 280, spawn: (p) => row(p, 4, 60, 60, flyer(0, { path: 'sine', amp: 60, freq: 0.04, firePattern: fireFan5, color: '#e0c0ff' })) },
		{ at: 420, spawn: (p) => row(p, 6, 30, 45, flyer(0, { speed: 2.0, firePattern: fireAimed3 })) },
		{ at: 560, spawn: (p) => p.spawn(midboss(160, { color: '#9050c0', firePattern: fireRing8 })) },
		{ at: 760, spawn: (p) => row(p, 8, 20, 35, flyer(0, { speed: 2.2, firePattern: fireAimed1, color: '#d0a0ff' })) },
		{ at: 880, spawn: (p) => row(p, 5, 45, 55, flyer(0, { path: 'sine', amp: 50, freq: 0.05, firePattern: fireRing4 })) },
	],
	boss: caveBoss,
};

// ================= STAGE 3 : MOON PALACE =================
const moonBoss: BossDef = {
	name: 'Moon Goddess',
	title: 'Tsuki no Megami',
	hp: 1800,
	color: '#f0e0a0',
	normal: (ctx, boss, t) => {
		if (t % 40 === 0) emitAimed(ctx, boss.x, boss.y, 4, 2.4, 0.7, 3, '#ffe8b0', '#fff');
		if (t % 110 === 55) emitRing(ctx, boss.x, boss.y, 8, 1.7, t * 0.04, 3, '#fff0c0', '#fff');
	},
	spells: [
		{
			name: 'Lunar Petal',
			duration: 420,
			color: '#ffe0a0',
			fire: (ctx, boss, t) => {
				if (t % 9 === 0) emitPetal(ctx, boss.x, boss.y, 10, 8, 1.7, 3, '#ffe0a0', '#fff');
			},
		},
		{
			name: 'Stardust Spiral',
			duration: 440,
			color: '#fff0c0',
			fire: (ctx, boss, t) => {
				if (t % 2 === 0) emitSpiralStep(ctx, boss.x, boss.y, 4, 2.1, t * 0.12, 3, '#fff0c0', '#fff');
				if (t % 2 === 1) emitSpiralStep(ctx, boss.x, boss.y, 4, 2.1, -t * 0.1 + 0.5, 3, '#ffe8b0', '#fff');
				if (t % 80 === 40) emitAimed(ctx, boss.x, boss.y, 2, 2.6, 0.2, 3, '#ffffff', '#fff');
			},
		},
		{
			name: 'Eclipse',
			duration: 480,
			color: '#e0c060',
			fire: (ctx, boss, t) => {
				if (t % 14 === 0) emitRing(ctx, boss.x, boss.y, 12, 1.9, t * 0.05, 3, '#e0c060', '#fff');
				if (t % 70 === 35) emitHoming(ctx, boss.x, boss.y, 5, 1.9, 0.05, 4, '#fff0c0', '#fff');
				if (t % 100 === 50) emitAimed(ctx, boss.x, boss.y, 6, 2.3, 1.0, 3, '#ffe8b0', '#fff');
			},
		},
	],
};

const stage3: StageDef = {
	name: 'The Palace of the Moon',
	theme: 'moon',
	length: 1020,
	waves: [
		{ at: 30, spawn: (p) => row(p, 6, 30, 45, flyer(0, { color: '#fff0c0', firePattern: fireAimed3 })) },
		{ at: 160, spawn: (p) => row(p, 5, 45, 55, flyer(0, { path: 'sine', amp: 55, freq: 0.04, firePattern: fireRing4, color: '#ffe8b0' })) },
		{ at: 300, spawn: (p) => row(p, 7, 25, 40, flyer(0, { speed: 2.0, firePattern: fireAimed3 })) },
		{ at: 440, spawn: (p) => row(p, 5, 45, 55, flyer(0, { path: 'curve', speed: 1.8, firePattern: fireFan5, color: '#fff0c0' })) },
		{ at: 600, spawn: (p) => p.spawn(midboss(160, { color: '#d0c080', hp: 80 })) },
		{ at: 640, spawn: (p) => row(p, 4, 60, 60, flyer(0, { path: 'sine', amp: 50, freq: 0.05, firePattern: fireRing4 })) },
		{ at: 820, spawn: (p) => row(p, 9, 15, 32, flyer(0, { speed: 2.4, firePattern: fireAimed1, color: '#ffe8b0' })) },
		{ at: 940, spawn: (p) => row(p, 5, 45, 55, flyer(0, { path: 'sine', amp: 60, freq: 0.05, firePattern: fireRing4 })) },
	],
	boss: moonBoss,
};

export const STAGES: StageDef[] = [stage1, stage2, stage3];
