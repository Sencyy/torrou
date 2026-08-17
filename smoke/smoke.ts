import './mocks';
import { press, release } from './mocks';
import { Game } from '../src/game';
import { Input } from '../src/input';
import { AudioSys } from '../src/audio';

const input = new Input();
input.attach();
const audio = new AudioSys();
const game = new Game(input, audio) as unknown as Record<string, any> & Game;

console.log('initial state:', game.state);

// title -> charSelect -> diffSelect -> playing (release one-shot keys between steps)
press('Enter');
game.update();
release('Enter');
press('Enter');
game.update();
release('Enter');
press('Enter');
game.update();
release('Enter');
console.log('state after start:', game.state);

press('KeyZ'); // hold shoot

let maxBullets = 0;
let maxEnemies = 0;
let sawBoss = false;
let sawSpell = false;
let stageClears = 0;
let endedAt = -1;
let prevState = game.state;

for (let i = 0; i < 40000; i++) {
	// God mode + keep player centered below the boss + max power
	game.player.iFrames = 100000;
	game.player.power = 9;
	game.player.x = 160;
	game.player.y = 400;
	// Force quick boss kills to exercise all stage transitions
	const boss = game.stage?.boss;
	if (boss && boss.active && boss.phase !== 'dying') boss.hp = 1;

	game.update();

	if (game.state === 'stageClear' && prevState !== 'stageClear') stageClears++;
	prevState = game.state;

	const eb = game.enemyBullets.countActive();
	if (eb > maxBullets) maxBullets = eb;
	const en = game.enemyPool.enemies.filter((e: { active: boolean }) => e.active).length;
	if (en > maxEnemies) maxEnemies = en;
	if (boss && boss.active) sawBoss = true;
	if (game.spellBanner) sawSpell = true;

	if (game.state === 'gameOver' || game.state === 'win') {
		endedAt = i;
		break;
	}
}

console.log('final state:', game.state, endedAt >= 0 ? `(ended at frame ${endedAt})` : '(ran full sim)');
console.log('score:', game.scoring.score, 'rank:', game.scoring.rank);
console.log('stage index reached:', game.stageIndex);
console.log('max enemy bullets on screen:', maxBullets);
console.log('max concurrent enemies:', maxEnemies);
console.log('saw boss:', sawBoss, 'saw spell card:', sawSpell);
console.log('player lives:', game.player.lives, 'bombs:', game.player.bombs, 'power:', game.player.power);
console.log('SMOKE OK');
