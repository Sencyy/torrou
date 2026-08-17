import type { Difficulty, DifficultyKey } from './types';

export const VIEW_W = 320;
export const VIEW_H = 480;
export const FPS = 60;
export const FRAME_MS = 1000 / FPS;

export const PLAYER = {
	speed: 2.6,
	focusSpeed: 1.3,
	hitbox: 3,
	focusMax: 360,
	focusRegen: 1.6,
	iFrames: 120,
	startPower: 2,
	startBombs: 3,
	maxPower: 9,
	maxBombs: 9,
	shootDelay: 7,
	bombCooldown: 90,
	magnetBase: 70,
	magnetPerRank: 6,
	maxRank: 14,
};

export const FAIRY = {
	followLerp: 0.09,
	baseRadius: 42,
	maxRadius: 95,
	moodDecay: 0.025,
	moodGain: 14,
	maxMood: 100,
};

export const BULLET = {
	maxEnemy: 1000,
	maxPlayer: 400,
};

export const SCORING = {
	enemyBase: 100,
	midbossBase: 1000,
	bossBase: 10000,
	perfectBonus: 5000,
	item10k: 10000,
};

export const STAGE_NORMAL_FRAMES = 480;
export const STAGE_NORMAL_FRAMES_BETWEEN_SPELLS = 180;

export const DIFFICULTIES: Record<DifficultyKey, Difficulty> = {
	easy: {
		label: 'Easy',
		bulletDensity: 0.7,
		bulletSpeed: 0.85,
		enemyCount: 0.7,
		bossHp: 0.7,
		scoreMult: 0.8,
	},
	normal: {
		label: 'Normal',
		bulletDensity: 1.0,
		bulletSpeed: 1.0,
		enemyCount: 1.0,
		bossHp: 1.0,
		scoreMult: 1.0,
	},
	hard: {
		label: 'Hard',
		bulletDensity: 1.3,
		bulletSpeed: 1.15,
		enemyCount: 1.3,
		bossHp: 1.3,
		scoreMult: 1.3,
	},
	lunatic: {
		label: 'Lunatic',
		bulletDensity: 1.6,
		bulletSpeed: 1.3,
		enemyCount: 1.6,
		bossHp: 1.6,
		scoreMult: 1.6,
	},
};
