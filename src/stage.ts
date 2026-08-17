import { Background } from './background';
import { Boss, type BossHooks } from './boss';
import type { EnemyPool } from './enemy';
import type { EmitCtx } from './patterns';
import type { StageDef } from './stages';

export class Stage {
	def: StageDef;
	frame = 0;
	bg: Background;
	boss: Boss | null = null;
	bossSpawned = false;
	private done = new Set<number>();

	constructor(def: StageDef) {
		this.def = def;
		this.bg = new Background(def.theme);
	}

	update(ctx: EmitCtx, pool: EnemyPool, hooks: BossHooks): void {
		this.frame++;
		this.bg.update();

		for (let i = 0; i < this.def.waves.length; i++) {
			if (this.frame === this.def.waves[i].at && !this.done.has(i)) {
				this.done.add(i);
				this.def.waves[i].spawn(pool, ctx.diff, ctx.rand);
			}
		}

		if (!this.bossSpawned && this.frame >= this.def.length) {
			this.bossSpawned = true;
			const hp = Math.round(this.def.boss.hp * ctx.diff.bossHp);
			this.boss = new Boss().activate({ ...this.def.boss, hp });
		}

		if (this.boss) this.boss.update(ctx, hooks);
	}
}
