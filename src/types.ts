export type DifficultyKey = 'easy' | 'normal' | 'hard' | 'lunatic';

export interface Difficulty {
	label: string;
	bulletDensity: number;
	bulletSpeed: number;
	enemyCount: number;
	bossHp: number;
	scoreMult: number;
}

export type GameState =
	| 'title'
	| 'charSelect'
	| 'diffSelect'
	| 'playing'
	| 'paused'
	| 'stageClear'
	| 'gameOver'
	| 'win';

export type ItemType = 'power' | 'bomb' | 'point' | 'fairy';

export type StageTheme = 'sea' | 'cave' | 'moon';
