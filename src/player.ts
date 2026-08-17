import { VIEW_H, VIEW_W } from './config';
import type { Character } from './characters';
import type { BulletPool } from './bullet';
import { clamp } from './collision';
import { KEYS, type Input } from './input';
import { PLAYER } from './config';

export class Player {
	x = VIEW_W / 2;
	y = VIEW_H - 80;
	char: Character;
	power = PLAYER.startPower;
	bombs = PLAYER.startBombs;
	lives = 3;
	focus = PLAYER.focusMax;
	focusing = false;
	iFrames = 0;
	shootTimer = 0;
	bombTimer = 0;
	bombCooldown = 0;
	itemRank = 0;
	dead = false;

	constructor(char: Character) {
		this.char = char;
	}

	reset(char: Character): void {
		this.char = char;
		this.x = VIEW_W / 2;
		this.y = VIEW_H - 80;
		this.power = PLAYER.startPower;
		this.bombs = PLAYER.startBombs;
		this.lives = 3;
		this.focus = PLAYER.focusMax;
		this.focusing = false;
		this.iFrames = 0;
		this.shootTimer = 0;
		this.bombTimer = 0;
		this.bombCooldown = 0;
		this.itemRank = 0;
		this.dead = false;
	}

	get speed(): number {
		return this.focusing ? this.char.focusSpeed : this.char.speed;
	}

	update(input: Input, pool: BulletPool): void {
		if (this.dead) return;
		let dx = 0;
		let dy = 0;
		if (input.isDown(...KEYS.left)) dx -= 1;
		if (input.isDown(...KEYS.right)) dx += 1;
		if (input.isDown(...KEYS.up)) dy -= 1;
		if (input.isDown(...KEYS.down)) dy += 1;
		const len = Math.hypot(dx, dy) || 1;
		this.x = clamp(this.x + (dx / len) * this.speed, 8, VIEW_W - 8);
		this.y = clamp(this.y + (dy / len) * this.speed, 8, VIEW_H - 8);

		const wantFocus = input.isDown(...KEYS.focus) && this.focus > 0;
		this.focusing = wantFocus;
		if (this.focusing) {
			this.focus = Math.max(0, this.focus - 1);
		} else {
			this.focus = Math.min(PLAYER.focusMax, this.focus + PLAYER.focusRegen);
		}

		this.shootTimer--;
		if (input.isDown(...KEYS.shoot) && this.shootTimer <= 0) {
			this.char.shot(pool, this.x, this.y, this.power);
			this.shootTimer = PLAYER.shootDelay;
		}

		if (this.iFrames > 0) this.iFrames--;
		if (this.bombTimer > 0) this.bombTimer--;
		if (this.bombCooldown > 0) this.bombCooldown--;
	}

	takeHit(): boolean {
		if (this.dead) return false;
		if (this.iFrames > 0 || this.bombTimer > 0) return false;
		this.lives--;
		if (this.lives <= 0) {
			this.dead = true;
			return true;
		}
		this.iFrames = PLAYER.iFrames;
		this.power = Math.max(0, this.power - 3);
		return true;
	}

	useBomb(): boolean {
		if (this.dead || this.bombs <= 0 || this.bombCooldown > 0) return false;
		this.bombs--;
		this.bombCooldown = PLAYER.bombCooldown;
		this.bombTimer = 100;
		return true;
	}
}
