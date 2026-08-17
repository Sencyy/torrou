import { FAIRY } from './config';
import type { ItemType } from './types';

export class Fairy {
	x = 0;
	y = 0;
	mood = 60;
	held: ItemType | null = null;
	color = '#bfe8ff';
	active = true;

	reset(x: number, y: number): void {
		this.x = x - 24;
		this.y = y - 24;
		this.mood = 60;
		this.held = null;
		this.active = true;
	}

	get radius(): number {
		return FAIRY.baseRadius + (FAIRY.maxRadius - FAIRY.baseRadius) * (this.mood / FAIRY.maxMood);
	}

	update(px: number, py: number): void {
		if (!this.active) return;
		const tx = px - 22;
		const ty = py - 22;
		this.x += (tx - this.x) * FAIRY.followLerp;
		this.y += (ty - this.y) * FAIRY.followLerp;
		this.mood = Math.max(0, this.mood - FAIRY.moodDecay);
	}
}
