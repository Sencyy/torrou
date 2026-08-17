import type { BulletPool } from './bullet';

export interface Character {
	id: string;
	name: string;
	title: string;
	color: string;
	accent: string;
	speed: number;
	focusSpeed: number;
	bombColor: string;
	shot: (pool: BulletPool, x: number, y: number, power: number) => void;
}

const P_BULLET = '#ffe9a8';
const P_CORE = '#fff';

function straight(pool: BulletPool, x: number, y: number, count: number, speed = 7): void {
	for (let i = 0; i < count; i++) {
		const off = (i - (count - 1) / 2) * 6;
		pool.spawn(x + off, y, -Math.PI / 2, speed, 3, P_BULLET, P_CORE);
	}
}

export const CHARACTERS: Character[] = [
	{
		id: 'aya',
		name: 'Aya',
		title: 'The Raven Tengu',
		color: '#e8e8f0',
		accent: '#7a7a9a',
		speed: 2.8,
		focusSpeed: 1.4,
		bombColor: '#9ad0ff',
		shot: (pool, x, y, power) => {
			// Center shot
			straight(pool, x, y, 3 + Math.floor(power / 3), 7);
			// 4-way spread
			const spread = 0.28;
			const arms = power >= 4 ? 2 : 1;
			for (let i = 0; i < arms; i++) {
				const s = 0.5 + i * 0.35;
				pool.spawn(x, y, -Math.PI / 2 - spread * s, 6.5, 3, P_BULLET, P_CORE);
				pool.spawn(x, y, -Math.PI / 2 + spread * s, 6.5, 3, P_BULLET, P_CORE);
			}
			if (power >= 6) {
				pool.spawn(x, y, -Math.PI / 2 - spread * 1.4, 6, 3, P_BULLET, P_CORE);
				pool.spawn(x, y, -Math.PI / 2 + spread * 1.4, 6, 3, P_BULLET, P_CORE);
			}
		},
	},
	{
		id: 'suika',
		name: 'Suika',
		title: 'The Watermelon Oni',
		color: '#ffd2e0',
		accent: '#c2507a',
		speed: 2.4,
		focusSpeed: 1.2,
		bombColor: '#ffb0d0',
		shot: (pool, x, y, power) => {
			// Wide beam: many parallel bullets
			const beams = 2 + Math.floor(power / 2);
			for (let i = 0; i < beams; i++) {
				const off = (i - (beams - 1) / 2) * 8;
				pool.spawn(x + off, y, -Math.PI / 2, 6, 4, P_BULLET, P_CORE);
			}
			// Heavy center
			pool.spawn(x, y, -Math.PI / 2, 7.5, 5, P_BULLET, P_CORE);
			if (power >= 5) {
				pool.spawn(x - 4, y, -Math.PI / 2, 7.5, 4, P_BULLET, P_CORE);
				pool.spawn(x + 4, y, -Math.PI / 2, 7.5, 4, P_BULLET, P_CORE);
			}
		},
	},
	{
		id: 'marisa',
		name: 'Marisa',
		title: 'The Witch of the Night',
		color: '#ffe0b0',
		accent: '#b06020',
		speed: 2.6,
		focusSpeed: 1.3,
		bombColor: '#ffd080',
		shot: (pool, x, y, power) => {
			// Piercing straight
			straight(pool, x, y, 2 + Math.floor(power / 3), 8);
			// Side shots
			const side = power >= 3 ? 2 : 1;
			for (let i = 0; i < side; i++) {
				const s = 0.6 + i * 0.5;
				pool.spawn(x - 10, y, -Math.PI / 2 - 0.12 * s, 6, 3, P_BULLET, P_CORE);
				pool.spawn(x + 10, y, -Math.PI / 2 + 0.12 * s, 6, 3, P_BULLET, P_CORE);
			}
			if (power >= 7) {
				pool.spawn(x - 16, y, -Math.PI / 2 - 0.2, 6, 3, P_BULLET, P_CORE);
				pool.spawn(x + 16, y, -Math.PI / 2 + 0.2, 6, 3, P_BULLET, P_CORE);
			}
		},
	},
];

export function getCharacter(id: string): Character {
	return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
