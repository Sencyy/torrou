import type { BulletPool } from './bullet';
import { VIEW_H } from './config';
import type { ItemType } from './types';
import type { EmitCtx } from './patterns';

export type EnemyKind = 'flyer' | 'midboss';
export type PathKind = 'straight' | 'sine' | 'curve' | 'hold';

export interface EnemyConfig {
	hp: number;
	kind: EnemyKind;
	path: PathKind;
	x: number;
	y?: number;
	speed?: number;
	amp?: number;
	freq?: number;
	targetY?: number;
	fireEvery?: number;
	firePattern?: (ctx: EmitCtx, e: Enemy) => void;
	color: string;
	score: number;
	drop?: ItemType;
}

export class Enemy {
	active = false;
	x = 0;
	y = 0;
	baseX = 0;
	speed = 1.2;
	hp = 1;
	maxHp = 1;
	kind: EnemyKind = 'flyer';
	path: PathKind = 'straight';
	amp = 0;
	freq = 0.05;
	targetY = 0;
	t = 0;
	fireTimer = 0;
	fireEvery = 60;
	firePattern: ((ctx: EmitCtx, e: Enemy) => void) | null = null;
	color = '#fff';
	score = 100;
	drop: ItemType | null = null;

	activate(cfg: EnemyConfig): this {
		this.active = true;
		this.x = cfg.x;
		this.baseX = cfg.x;
		this.y = cfg.y ?? -20;
		this.speed = cfg.speed ?? 1.2;
		this.hp = cfg.hp;
		this.maxHp = cfg.hp;
		this.kind = cfg.kind;
		this.path = cfg.path;
		this.amp = cfg.amp ?? 0;
		this.freq = cfg.freq ?? 0.05;
		this.targetY = cfg.targetY ?? 0;
		this.fireEvery = cfg.fireEvery ?? 60;
		this.firePattern = cfg.firePattern ?? null;
		this.color = cfg.color;
		this.score = cfg.score;
		this.drop = cfg.drop ?? null;
		this.t = 0;
		this.fireTimer = this.fireEvery;
		return this;
	}

	update(ctx: EmitCtx): boolean {
		this.t++;
		switch (this.path) {
			case 'straight':
				this.y += this.speed;
				break;
			case 'sine':
				this.y += this.speed;
				this.x = this.baseX + Math.sin(this.t * this.freq) * this.amp;
				break;
			case 'curve':
				this.y += this.speed;
				this.x += (this.baseX - this.x) * 0.02;
				break;
			case 'hold':
				if (this.y < this.targetY) this.y += this.speed;
				this.x = this.baseX + Math.sin(this.t * 0.02) * 24;
				break;
		}
		if (this.firePattern && this.y > 10) {
			this.fireTimer--;
			if (this.fireTimer <= 0) {
				this.firePattern(ctx, this);
				this.fireTimer = this.fireEvery;
			}
		}
		if (this.y > VIEW_H + 24) {
			this.active = false;
			return false;
		}
		return true;
	}
}

export class EnemyPool {
	enemies: Enemy[];

	constructor(size: number) {
		this.enemies = Array.from({ length: size }, () => new Enemy());
	}

	spawn(cfg: EnemyConfig): Enemy | null {
		for (const e of this.enemies) {
			if (!e.active) return e.activate(cfg);
		}
		return null;
	}

	forEachActive(fn: (e: Enemy) => void): void {
		for (const e of this.enemies) if (e.active) fn(e);
	}

	clear(): void {
		for (const e of this.enemies) e.active = false;
	}
}

export type { BulletPool };
