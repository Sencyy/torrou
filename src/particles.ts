import { VIEW_H, VIEW_W } from './config';

export class Particle {
	active = false;
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	life = 0;
	maxLife = 30;
	size = 2;
	color = '#fff';
	fade = true;

	activate(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string): this {
		this.active = true;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.life = 0;
		this.maxLife = life;
		this.size = size;
		this.color = color;
		return this;
	}

	update(): boolean {
		this.x += this.vx;
		this.y += this.vy;
		this.vx *= 0.96;
		this.vy *= 0.96;
		this.life++;
		if (this.life >= this.maxLife) {
			this.active = false;
			return false;
		}
		return true;
	}
}

export class ParticlePool {
	particles: Particle[];

	constructor(size: number) {
		this.particles = Array.from({ length: size }, () => new Particle());
	}

	spawn(
		x: number,
		y: number,
		vx: number,
		vy: number,
		life: number,
		size: number,
		color: string,
	): Particle | null {
		for (const p of this.particles) {
			if (!p.active) return p.activate(x, y, vx, vy, life, size, color);
		}
		return null;
	}

	forEachActive(fn: (p: Particle) => void): void {
		for (const p of this.particles) if (p.active) fn(p);
	}

	clear(): void {
		for (const p of this.particles) p.active = false;
	}
}

export function explode(
	pool: ParticlePool,
	x: number,
	y: number,
	color: string,
	n: number,
	speedMax = 3,
	life = 25,
): void {
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = Math.random() * speedMax;
		pool.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, life + Math.random() * 10, 1 + Math.random() * 2, color);
	}
}

export function bombFlash(pool: ParticlePool): void {
	for (let i = 0; i < 80; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = 2 + Math.random() * 5;
		pool.spawn(
			VIEW_W / 2,
			VIEW_H / 2,
			Math.cos(a) * s,
			Math.sin(a) * s,
			40 + Math.random() * 30,
			2 + Math.random() * 3,
			i % 2 ? '#fff' : '#ffd28a',
		);
	}
}
