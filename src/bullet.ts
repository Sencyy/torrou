import { BULLET } from './config';

export class Bullet {
	active = false;
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	r = 3;
	color = '#fff';
	core = '#fff';
	accel = 0;
	homing = 0;
	targetX = 0;
	targetY = 0;
	spin = 0;
	angle = 0;
	life = 0;

	activate(
		x: number,
		y: number,
		angle: number,
		speed: number,
		r: number,
		color: string,
		core: string,
	): this {
		this.active = true;
		this.x = x;
		this.y = y;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.r = r;
		this.color = color;
		this.core = core;
		this.accel = 0;
		this.homing = 0;
		this.spin = 0;
		this.angle = angle;
		this.life = 0;
		return this;
	}

	update(viewW: number, viewH: number): boolean {
		if (this.accel !== 0) {
			const sp = Math.hypot(this.vx, this.vy);
			const ns = Math.max(0.1, sp + this.accel);
			this.vx = (this.vx / sp) * ns;
			this.vy = (this.vy / sp) * ns;
		}
		if (this.homing !== 0) {
			const cur = Math.atan2(this.vy, this.vx);
			const want = Math.atan2(this.targetY - this.y, this.targetX - this.x);
			let d = want - cur;
			while (d > Math.PI) d -= Math.PI * 2;
			while (d < -Math.PI) d += Math.PI * 2;
			const na = cur + clampAngle(d, this.homing);
			const sp = Math.hypot(this.vx, this.vy);
			this.vx = Math.cos(na) * sp;
			this.vy = Math.sin(na) * sp;
		}
		this.x += this.vx;
		this.y += this.vy;
		this.life++;
		if (
			this.x < -30 ||
			this.x > viewW + 30 ||
			this.y < -30 ||
			this.y > viewH + 30 ||
			this.life > 2400
		) {
			this.active = false;
			return false;
		}
		return true;
	}
}

function clampAngle(d: number, max: number): number {
	return d < -max ? -max : d > max ? max : d;
}

export class BulletPool {
	bullets: Bullet[];

	constructor(size: number) {
		this.bullets = Array.from({ length: size }, () => new Bullet());
	}

	spawn(
		x: number,
		y: number,
		angle: number,
		speed: number,
		r: number,
		color: string,
		core: string,
	): Bullet | null {
		for (const b of this.bullets) {
			if (!b.active) return b.activate(x, y, angle, speed, r, color, core);
		}
		return null;
	}

	forEachActive(fn: (b: Bullet) => void): void {
		for (const b of this.bullets) if (b.active) fn(b);
	}

	countActive(): number {
		let n = 0;
		for (const b of this.bullets) if (b.active) n++;
		return n;
	}

	clear(): void {
		for (const b of this.bullets) b.active = false;
	}
}

export function makeEnemyPool(): BulletPool {
	return new BulletPool(BULLET.maxEnemy);
}

export function makePlayerPool(): BulletPool {
	return new BulletPool(BULLET.maxPlayer);
}
