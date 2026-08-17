import type { ItemType } from './types';

export class Item {
	active = false;
	x = 0;
	y = 0;
	vy = 0.8;
	type: ItemType = 'point';

	activate(x: number, y: number, type: ItemType): this {
		this.active = true;
		this.x = x;
		this.y = y;
		this.vy = 0.8;
		this.type = type;
		return this;
	}

	update(viewH: number): boolean {
		this.y += this.vy;
		if (this.y > viewH + 10) {
			this.active = false;
			return false;
		}
		return true;
	}
}

export class ItemPool {
	items: Item[];

	constructor(size: number) {
		this.items = Array.from({ length: size }, () => new Item());
	}

	spawn(x: number, y: number, type: ItemType): Item | null {
		for (const it of this.items) {
			if (!it.active) return it.activate(x, y, type);
		}
		return null;
	}

	forEachActive(fn: (it: Item) => void): void {
		for (const it of this.items) if (it.active) fn(it);
	}

	clear(): void {
		for (const it of this.items) it.active = false;
	}
}
