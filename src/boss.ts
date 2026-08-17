import { VIEW_W, STAGE_NORMAL_FRAMES, STAGE_NORMAL_FRAMES_BETWEEN_SPELLS } from './config';
import type { EmitCtx } from './patterns';

export interface SpellCard {
	name: string;
	duration: number;
	fire: (ctx: EmitCtx, boss: Boss, t: number) => void;
	color: string;
}

export interface BossDef {
	name: string;
	title: string;
	hp: number;
	color: string;
	normal: (ctx: EmitCtx, boss: Boss, t: number) => void;
	spells: SpellCard[];
}

export type BossPhase = 'enter' | 'normal' | 'spell' | 'dying';

export interface BossHooks {
	onSpellStart: (spell: SpellCard) => void;
	onSpellEnd: (spell: SpellCard, perfect: boolean) => void;
	onDefeated: () => void;
}

export class Boss {
	active = false;
	x = VIEW_W / 2;
	y = -70;
	hp = 1;
	maxHp = 1;
	def: BossDef | null = null;
	phase: BossPhase = 'enter';
	phaseTimer = 0;
	spellIndex = 0;
	hitDuringSpell = false;
	entryY = 80;
	dyingTimer = 0;

	activate(def: BossDef): this {
		this.active = true;
		this.def = def;
		this.hp = def.hp;
		this.maxHp = def.hp;
		this.x = VIEW_W / 2;
		this.y = -70;
		this.phase = 'enter';
		this.phaseTimer = 0;
		this.spellIndex = 0;
		this.hitDuringSpell = false;
		this.dyingTimer = 0;
		return this;
	}

	get currentSpell(): SpellCard | null {
		if (this.phase === 'spell' && this.def) return this.def.spells[this.spellIndex];
		return null;
	}

	update(ctx: EmitCtx, hooks: BossHooks): void {
		if (!this.active || !this.def) return;
		// Gentle sway
		if (this.phase !== 'enter' && this.phase !== 'dying') {
			this.x = VIEW_W / 2 + Math.sin(this.phaseTimer * 0.01) * 40;
		}

		switch (this.phase) {
			case 'enter':
				this.y += 1.2;
				if (this.y >= this.entryY) {
					this.phase = 'normal';
					this.phaseTimer = 0;
				}
				break;
			case 'normal':
				this.phaseTimer++;
				this.def.normal(ctx, this, this.phaseTimer);
				if (this.phaseTimer >= (this.spellIndex === 0 ? STAGE_NORMAL_FRAMES : STAGE_NORMAL_FRAMES_BETWEEN_SPELLS)) {
					this.startSpell(hooks);
				}
				break;
			case 'spell': {
				this.phaseTimer++;
				const spell = this.def.spells[this.spellIndex];
				spell.fire(ctx, this, this.phaseTimer);
				if (this.phaseTimer >= spell.duration) {
					const perfect = !this.hitDuringSpell;
					hooks.onSpellEnd(spell, perfect);
					this.spellIndex++;
					if (this.spellIndex >= this.def.spells.length) this.spellIndex = 0;
					this.phase = 'normal';
					this.phaseTimer = 0;
					this.hitDuringSpell = false;
				}
				break;
			}
			case 'dying':
				this.dyingTimer++;
				break;
		}
	}

	startSpell(hooks: BossHooks): void {
		if (!this.def) return;
		this.phase = 'spell';
		this.phaseTimer = 0;
		this.hitDuringSpell = false;
		hooks.onSpellStart(this.def.spells[this.spellIndex]);
	}

	takeDamage(n: number): boolean {
		if (!this.active || this.phase === 'dying') return false;
		this.hp -= n;
		if (this.hp <= 0) {
			this.hp = 0;
			this.phase = 'dying';
			this.dyingTimer = 0;
			return true;
		}
		return false;
	}

	markPlayerHit(): void {
		if (this.phase === 'spell') this.hitDuringSpell = true;
	}
}
