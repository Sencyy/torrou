import { AudioSys } from './audio';
import { Boss, type BossHooks, type SpellCard } from './boss';
import { makeEnemyPool, makePlayerPool } from './bullet';
import { VIEW_H, VIEW_W, PLAYER, SCORING, DIFFICULTIES } from './config';
import { circleHit, dist2 } from './collision';
import { CHARACTERS, type Character } from './characters';
import { EnemyPool, type Enemy } from './enemy';
import { Fairy } from './fairy';
import { drawBoss, drawBullet, drawEnemy, drawFairy, drawHitbox, drawItem, drawPlayer } from './render';
import { drawHUD, drawPerfect, drawSpellBanner, type HudData } from './hud';
import { Input, KEYS } from './input';
import { ItemPool } from './item';
import {
	drawCharSelect,
	drawDiffSelect,
	drawEnd,
	drawPause,
	drawTitle,
} from './menus';
import { type EmitCtx } from './patterns';
import { bombFlash, explode, ParticlePool } from './particles';
import { Player } from './player';
import { Scoring } from './scoring';
import { Stage } from './stage';
import { STAGES } from './stages';
import { type Difficulty, type DifficultyKey, type GameState, type ItemType } from './types';

const DIFF_KEYS: DifficultyKey[] = ['easy', 'normal', 'hard', 'lunatic'];

export class Game {
	state: GameState = 'title';
	frame = 0;

	private input: Input;
	private audio: AudioSys;
	private scoring = new Scoring();

	private charIndex = 0;
	private diffIndex = 1;
	private char: Character = CHARACTERS[0];
	private difficulty: Difficulty = DIFFICULTIES.normal;

	private player = new Player(CHARACTERS[0]);
	private fairy = new Fairy();
	private enemyBullets = makeEnemyPool();
	private playerBullets = makePlayerPool();
	private enemyPool = new EnemyPool(48);
	private itemPool = new ItemPool(80);
	private particlePool = new ParticlePool(400);

	private stage: Stage | null = null;
	private stageIndex = 0;
	private stageClearTimer = 0;
	private flash = 0;
	private spellBanner: { name: string; timer: number; color: string } | null = null;
	private perfectTimer = 0;

	constructor(input: Input, audio: AudioSys) {
		this.input = input;
		this.audio = audio;
	}

	private makeCtx(): EmitCtx {
		return {
			pool: this.enemyBullets,
			diff: this.difficulty,
			playerX: this.player.x,
			playerY: this.player.y,
			t: this.frame,
			rand: Math.random,
		};
	}

	private bossHooks: BossHooks = {
		onSpellStart: (spell: SpellCard) => {
			this.spellBanner = { name: spell.name, timer: 120, color: spell.color };
			this.audio.play('spellcard');
		},
		onSpellEnd: (_spell: SpellCard, perfect: boolean) => {
			if (perfect) {
				this.scoring.add(SCORING.perfectBonus * this.difficulty.scoreMult);
				this.perfectTimer = 90;
			}
		},
		onDefeated: () => {},
	};

	// ---------- state transitions ----------
	startGame(): void {
		this.char = CHARACTERS[this.charIndex];
		this.difficulty = DIFFICULTIES[DIFF_KEYS[this.diffIndex]];
		this.player.reset(this.char);
		this.fairy.reset(this.player.x, this.player.y);
		this.scoring = new Scoring();
		this.startStage(0);
		this.state = 'playing';
	}

	private startStage(i: number): void {
		this.stageIndex = i;
		this.stage = new Stage(STAGES[i]);
		this.enemyBullets.clear();
		this.playerBullets.clear();
		this.enemyPool.clear();
		this.itemPool.clear();
		this.particlePool.clear();
		this.player.x = VIEW_W / 2;
		this.player.y = VIEW_H - 80;
		this.player.iFrames = 60;
		this.fairy.reset(this.player.x, this.player.y);
		this.spellBanner = null;
	}

	private nextStage(): void {
		if (this.stageIndex < STAGES.length - 1) {
			this.startStage(this.stageIndex + 1);
			this.state = 'playing';
		} else {
			this.scoring.finish();
			this.state = 'win';
		}
	}

	private gameOver(): void {
		this.scoring.finish();
		this.state = 'gameOver';
		this.audio.play('gameover');
	}

	// ---------- update ----------
	update(): void {
		this.frame++;
		if (this.input.wasPressed(KEYS.mute[0])) this.audio.setMuted(!this.audio.muted);

		switch (this.state) {
			case 'title':
				if (this.input.wasPressed(...KEYS.confirm)) {
					this.audio.play('select');
					this.state = 'charSelect';
				}
				break;
			case 'charSelect':
				if (this.input.wasPressed(...KEYS.left)) {
					this.charIndex = (this.charIndex + CHARACTERS.length - 1) % CHARACTERS.length;
					this.audio.play('select');
				}
				if (this.input.wasPressed(...KEYS.right)) {
					this.charIndex = (this.charIndex + 1) % CHARACTERS.length;
					this.audio.play('select');
				}
				if (this.input.wasPressed(...KEYS.confirm)) {
					this.audio.play('select');
					this.state = 'diffSelect';
				}
				if (this.input.wasPressed(...KEYS.back)) this.state = 'title';
				break;
			case 'diffSelect':
				if (this.input.wasPressed(...KEYS.up)) {
					this.diffIndex = (this.diffIndex + DIFF_KEYS.length - 1) % DIFF_KEYS.length;
					this.audio.play('select');
				}
				if (this.input.wasPressed(...KEYS.down)) {
					this.diffIndex = (this.diffIndex + 1) % DIFF_KEYS.length;
					this.audio.play('select');
				}
				if (this.input.wasPressed(...KEYS.confirm)) {
					this.audio.play('select');
					this.startGame();
				}
				if (this.input.wasPressed(...KEYS.back)) this.state = 'charSelect';
				break;
			case 'playing':
				if (this.input.wasPressed(...KEYS.back)) {
					this.state = 'paused';
				} else {
					this.updatePlaying();
				}
				break;
			case 'paused':
				if (this.input.wasPressed(...KEYS.back) || this.input.wasPressed(...KEYS.confirm)) {
					this.state = 'playing';
				} else if (this.input.wasPressed('KeyB')) {
					this.state = 'title';
				}
				break;
			case 'stageClear':
				this.stageClearTimer--;
				this.stage?.bg.update();
				this.particlePool.forEachActive((p) => p.update());
				if (this.stageClearTimer <= 0) this.nextStage();
				break;
			case 'gameOver':
			case 'win':
				if (this.input.wasPressed(...KEYS.confirm)) this.state = 'title';
				break;
		}
		this.input.endFrame();
	}

	private updatePlaying(): void {
		const ctx = this.makeCtx();

		// Player
		this.player.update(this.input, this.playerBullets);
		if (this.input.wasPressed(...KEYS.bomb) && this.player.useBomb()) {
			this.enemyBullets.clear();
			bombFlash(this.particlePool);
			this.flash = 18;
			this.audio.play('bomb');
		}
		if (this.input.wasPressed(...KEYS.swap)) this.trySwap();

		// Fairy
		this.fairy.update(this.player.x, this.player.y);

		// Stage (waves + boss)
		this.stage?.update(ctx, this.enemyPool, this.bossHooks);

		// Enemies
		this.enemyPool.forEachActive((e) => e.update(ctx));

		// Bullets
		this.enemyBullets.forEachActive((b) => b.update(VIEW_W, VIEW_H));
		this.playerBullets.forEachActive((b) => b.update(VIEW_W, VIEW_H));

		// Items
		this.updateItems();

		// Particles
		this.particlePool.forEachActive((p) => p.update());

		// Collisions
		this.collidePlayerBullets();
		this.collideEnemyBullets();

		// Effects
		if (this.flash > 0) this.flash--;
		if (this.spellBanner) {
			this.spellBanner.timer--;
			if (this.spellBanner.timer <= 0) this.spellBanner = null;
		}
		if (this.perfectTimer > 0) this.perfectTimer--;

		if (this.player.dead) this.gameOver();
	}

	private trySwap(): void {
		if (this.fairy.held) {
			const type = this.fairy.held;
			this.fairy.held = null;
			this.applyItem(type);
			this.fairy.mood = Math.min(100, this.fairy.mood + 6);
			this.audio.play('swap');
		}
	}

	private applyItem(type: ItemType): void {
		switch (type) {
			case 'power':
				this.player.power = Math.min(PLAYER.maxPower, this.player.power + 1);
				this.player.itemRank = Math.min(PLAYER.maxRank, this.player.itemRank + 1);
				break;
			case 'bomb':
				this.player.bombs = Math.min(PLAYER.maxBombs, this.player.bombs + 1);
				break;
			case 'point':
				this.scoring.add(SCORING.item10k * this.difficulty.scoreMult);
				break;
			case 'fairy':
				this.scoring.add(1000);
				break;
		}
	}

	private updateItems(): void {
		const magnetR = PLAYER.magnetBase + this.player.itemRank * PLAYER.magnetPerRank;
		const pickupR = 12;
		this.itemPool.forEachActive((it) => {
			if (!it.active) return;
			it.update(VIEW_H);

			const pd = dist2(it.x, it.y, this.player.x, this.player.y);
			if (pd < pickupR * pickupR) {
				it.active = false;
				this.applyItem(it.type);
				this.audio.play('pickup');
				return;
			}

			const fd = dist2(it.x, it.y, this.fairy.x, this.fairy.y);
			const fr = this.fairy.radius;
			if (this.fairy.active && fd < fr * fr) {
				it.active = false;
				if (it.type === 'point') {
					this.scoring.add(SCORING.item10k * this.difficulty.scoreMult);
				} else if (it.type === 'fairy') {
					this.scoring.add(1000);
				} else {
					this.fairy.held = it.type;
					this.fairy.mood = Math.min(100, this.fairy.mood + 14);
				}
				this.audio.play('pickup');
				return;
			}

			if (pd < magnetR * magnetR) {
				const d = Math.sqrt(pd) || 1;
				it.x += ((this.player.x - it.x) / d) * 2.2;
				it.y += ((this.player.y - it.y) / d) * 2.2;
			}
		});
	}

	private killEnemy(e: Enemy): void {
		e.active = false;
		this.scoring.add(e.score * this.difficulty.scoreMult);
		explode(this.particlePool, e.x, e.y, e.color, e.kind === 'midboss' ? 26 : 10);
		this.audio.play('kill');
		if (e.drop) this.itemPool.spawn(e.x, e.y, e.drop);
		if (e.kind === 'midboss') {
			this.itemPool.spawn(e.x - 10, e.y, 'bomb');
			this.itemPool.spawn(e.x + 10, e.y, 'point');
		}
	}

	private collidePlayerBullets(): void {
		this.playerBullets.forEachActive((pb) => {
			if (!pb.active) return;
			// vs enemies
			let hit = false;
			this.enemyPool.forEachActive((e) => {
				if (hit) return;
				const r = e.kind === 'midboss' ? 14 : 7;
				if (circleHit(pb.x, pb.y, 3, e.x, e.y, r)) {
					pb.active = false;
					hit = true;
					e.hp -= 1;
					if (e.hp <= 0) this.killEnemy(e);
				}
			});
			if (hit) return;
			// vs boss
			const boss = this.stage?.boss;
			if (boss && boss.active && boss.phase !== 'dying' && circleHit(pb.x, pb.y, 3, boss.x, boss.y, 22)) {
				pb.active = false;
				if (boss.takeDamage(1)) this.onBossDefeated(boss);
			}
		});
	}

	private onBossDefeated(boss: Boss): void {
		this.scoring.add(SCORING.bossBase * this.difficulty.scoreMult);
		for (let i = 0; i < 5; i++) {
			explode(
				this.particlePool,
				boss.x + (Math.random() - 0.5) * 40,
				boss.y + (Math.random() - 0.5) * 40,
				boss.def?.color ?? '#fff',
				20,
			);
		}
		this.enemyBullets.clear();
		boss.active = false;
		// Drops
		this.itemPool.spawn(boss.x - 20, boss.y, 'power');
		this.itemPool.spawn(boss.x, boss.y, 'bomb');
		this.itemPool.spawn(boss.x + 20, boss.y, 'point');
		this.itemPool.spawn(boss.x, boss.y + 20, 'point');
		this.audio.play('stageclear');
		this.stageClearTimer = 180;
		this.state = 'stageClear';
	}

	private collideEnemyBullets(): void {
		if (this.player.dead) return;
		const pr = PLAYER.hitbox;
		this.enemyBullets.forEachActive((b) => {
			if (!b.active) return;
			if (circleHit(b.x, b.y, b.r, this.player.x, this.player.y, pr)) {
				b.active = false;
				if (this.player.takeHit()) {
					this.stage?.boss?.markPlayerHit();
					// Clear nearby bullets
					this.enemyBullets.forEachActive((ob) => {
						if (dist2(ob.x, ob.y, this.player.x, this.player.y) < 70 * 70) ob.active = false;
					});
					explode(this.particlePool, this.player.x, this.player.y, '#ff8080', 16, 3);
					this.audio.play('hit');
				}
			}
		});
	}

	// ---------- render ----------
	render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		switch (this.state) {
			case 'title':
				drawTitle(ctx, this.frame, this.scoring.hiScore);
				break;
			case 'charSelect':
				drawCharSelect(ctx, CHARACTERS, this.charIndex, this.frame);
				break;
			case 'diffSelect':
				drawDiffSelect(
					ctx,
					DIFF_KEYS.map((k) => DIFFICULTIES[k]),
					this.diffIndex,
					this.frame,
				);
				break;
			case 'playing':
			case 'paused':
			case 'stageClear':
				this.renderPlaying(ctx);
				if (this.state === 'paused') drawPause(ctx);
				break;
			case 'gameOver':
				drawEnd(ctx, 'GAME OVER', '#ff8080', this.scoring.score, this.scoring.rank, this.scoring.hiScore, this.scoring.isNewHighScore, this.frame);
				break;
			case 'win':
				drawEnd(ctx, 'STAGE CLEAR!', '#ffe080', this.scoring.score, this.scoring.rank, this.scoring.hiScore, this.scoring.isNewHighScore, this.frame);
				break;
		}
		ctx.restore();
	}

	private renderPlaying(ctx: CanvasRenderingContext2D): void {
		// Background
		this.stage?.bg.draw(ctx);

		// Items
		this.itemPool.forEachActive((it) => drawItem(ctx, it, this.frame));

		// Fairy
		if (this.fairy.active) drawFairy(ctx, this.fairy.x, this.fairy.y, this.frame, this.fairy.color);

		// Enemies
		this.enemyPool.forEachActive((e) => drawEnemy(ctx, e, this.frame));

		// Boss
		const boss = this.stage?.boss;
		if (boss && boss.active) drawBoss(ctx, boss, this.frame);

		// Player
		const blink = this.player.iFrames > 0 && this.player.iFrames < 90;
		drawPlayer(ctx, this.player.x, this.player.y, this.player.char, this.player.focusing, blink, this.frame);
		drawHitbox(ctx, this.player.x, this.player.y, PLAYER.hitbox);

		// Player bullets
		this.playerBullets.forEachActive((b) => drawBullet(ctx, b));

		// Enemy bullets (on top, additive)
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		this.enemyBullets.forEachActive((b) => drawBullet(ctx, b));
		ctx.restore();

		// Particles
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		this.particlePool.forEachActive((p) => {
			const a = 1 - p.life / p.maxLife;
			ctx.globalAlpha = a;
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.restore();

		// Bomb flash
		if (this.flash > 0) {
			ctx.save();
			ctx.globalAlpha = this.flash / 18;
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, VIEW_W, VIEW_H);
			ctx.restore();
		}

		// HUD
		const hud: HudData = {
			lives: this.player.lives,
			bombs: this.player.bombs,
			power: this.player.power,
			focus: this.player.focus,
			focusMax: PLAYER.focusMax,
			score: this.scoring.score,
			hiScore: this.scoring.hiScore,
			rank: this.scoring.rank,
			stageName: this.stage?.def.name ?? '',
			stageIndex: this.stageIndex,
			stageCount: STAGES.length,
			fairyMood: this.fairy.mood,
			fairyActive: this.fairy.active,
			itemRank: this.player.itemRank,
			charName: this.player.char.name,
			charColor: this.player.char.color,
			diffLabel: this.difficulty.label,
		};
		drawHUD(ctx, hud);

		if (this.spellBanner) {
			drawSpellBanner(ctx, this.spellBanner.name, this.spellBanner.timer, this.spellBanner.color);
		}
		if (this.perfectTimer > 0) drawPerfect(ctx, this.perfectTimer);

		if (this.state === 'stageClear') {
			ctx.save();
			ctx.textAlign = 'center';
			ctx.fillStyle = '#ffe8c0';
			ctx.font = 'bold 20px monospace';
			ctx.fillText('STAGE CLEAR', VIEW_W / 2, 200);
			ctx.fillStyle = 'rgba(255,255,255,0.7)';
			ctx.font = '11px monospace';
			ctx.fillText(this.stage?.def.name ?? '', VIEW_W / 2, 226);
			ctx.restore();
		}
	}
}
