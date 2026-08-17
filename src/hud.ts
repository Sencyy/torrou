import { VIEW_H, VIEW_W } from './config';
import { glowCircle, hexA, roundedRect } from './gfx';

export interface HudData {
	lives: number;
	bombs: number;
	power: number;
	focus: number;
	focusMax: number;
	score: number;
	hiScore: number;
	rank: string;
	stageName: string;
	stageIndex: number;
	stageCount: number;
	fairyMood: number;
	fairyActive: boolean;
	itemRank: number;
	charName: string;
	charColor: string;
	diffLabel: string;
}

export function drawHUD(ctx: CanvasRenderingContext2D, d: HudData): void {
	ctx.save();
	ctx.font = '10px monospace';
	ctx.textBaseline = 'top';

	// Top bar panel
	roundedRect(ctx, 3, 3, VIEW_W - 6, 26, 7);
	ctx.fillStyle = 'rgba(8, 6, 20, 0.6)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 235, 200, 0.22)';
	ctx.lineWidth = 1;
	ctx.stroke();

	// Lives
	ctx.fillStyle = 'rgba(255,255,255,0.85)';
	ctx.textAlign = 'left';
	ctx.fillText('LV', 8, 5);
	for (let i = 0; i < Math.max(0, d.lives); i++) {
		const lx = 30 + i * 13;
		glowCircle(ctx, lx, 9, 7, d.charColor, 0.3);
		ctx.fillStyle = d.charColor;
		ctx.beginPath();
		ctx.moveTo(lx, 4);
		ctx.lineTo(lx + 5, 12);
		ctx.lineTo(lx - 5, 12);
		ctx.closePath();
		ctx.fill();
	}

	// Bombs
	ctx.fillStyle = 'rgba(255,255,255,0.85)';
	ctx.fillText('BM', 8, 16);
	for (let i = 0; i < d.bombs; i++) {
		const bx = 32 + i * 10;
		glowCircle(ctx, bx, 20, 6, '#80c0ff', 0.35);
		ctx.fillStyle = '#80c0ff';
		ctx.beginPath();
		ctx.arc(bx, 20, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = 'rgba(255,255,255,0.85)';
		ctx.beginPath();
		ctx.arc(bx - 1, 19, 1, 0, Math.PI * 2);
		ctx.fill();
	}

	// Power / item
	ctx.textAlign = 'left';
	ctx.fillStyle = '#ff9090';
	ctx.fillText(`PWR ${d.power}`, 74, 5);
	ctx.fillStyle = '#ffe080';
	ctx.fillText(`ITM ${d.itemRank}`, 74, 16);

	// Score
	ctx.textAlign = 'right';
	ctx.fillStyle = '#fff';
	ctx.fillText(`SCORE ${d.score}`, VIEW_W - 8, 5);
	ctx.fillStyle = '#ffe080';
	ctx.fillText(`HI ${d.hiScore}`, VIEW_W - 8, 16);

	// Focus meter (bottom center)
	const fw = 130;
	const fx = (VIEW_W - fw) / 2;
	const fy = VIEW_H - 15;
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgba(255,255,255,0.55)';
	ctx.font = '8px monospace';
	ctx.fillText('FOCUS', VIEW_W / 2, fy - 10);
	roundedRect(ctx, fx, fy, fw, 6, 3);
	ctx.fillStyle = 'rgba(8, 6, 20, 0.7)';
	ctx.fill();
	const frac = Math.max(0, Math.min(1, d.focus / d.focusMax));
	if (frac > 0) {
		const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy);
		fg.addColorStop(0, frac > 0.3 ? '#3a90d8' : '#d85050');
		fg.addColorStop(1, frac > 0.3 ? '#9ae4ff' : '#ff9090');
		ctx.save();
		roundedRect(ctx, fx, fy, fw, 6, 3);
		ctx.clip();
		ctx.fillStyle = fg;
		ctx.fillRect(fx, fy, fw * frac, 6);
		ctx.restore();
	}
	ctx.strokeStyle = 'rgba(255, 235, 200, 0.35)';
	ctx.lineWidth = 1;
	roundedRect(ctx, fx, fy, fw, 6, 3);
	ctx.stroke();

	// Fairy mood (bottom right)
	if (d.fairyActive) {
		ctx.textAlign = 'right';
		ctx.fillStyle = '#bfe8ff';
		ctx.font = '8px monospace';
		ctx.fillText('FAIRY', VIEW_W - 8, fy - 10);
		const mw = 44;
		const mx = VIEW_W - 8 - mw;
		roundedRect(ctx, mx, fy, mw, 5, 2.5);
		ctx.fillStyle = 'rgba(8, 6, 20, 0.7)';
		ctx.fill();
		ctx.save();
		roundedRect(ctx, mx, fy, mw, 5, 2.5);
		ctx.clip();
		ctx.fillStyle = d.fairyMood > 40 ? '#bfe8ff' : '#ff9090';
		ctx.fillRect(mx, fy, (mw * d.fairyMood) / 100, 5);
		ctx.restore();
		ctx.strokeStyle = 'rgba(255, 235, 200, 0.3)';
		roundedRect(ctx, mx, fy, mw, 5, 2.5);
		ctx.stroke();
	}

	// Stage label (below the bar)
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgba(255,255,255,0.9)';
	ctx.font = '9px monospace';
	ctx.shadowColor = 'rgba(0,0,0,0.8)';
	ctx.shadowBlur = 3;
	ctx.fillText(`STAGE ${d.stageIndex + 1}/${d.stageCount}  ${d.stageName}`, VIEW_W / 2, 32);
	ctx.fillStyle = hexA(d.charColor, 0.85);
	ctx.fillText(`${d.charName}  ·  ${d.diffLabel}`, VIEW_W / 2, 43);
	ctx.shadowBlur = 0;

	ctx.restore();
}

export function drawSpellBanner(
	ctx: CanvasRenderingContext2D,
	name: string,
	timer: number,
	color: string,
): void {
	const a = timer > 90 ? (120 - timer) / 30 : timer < 30 ? timer / 30 : 1;
	ctx.save();
	ctx.globalAlpha = Math.max(0, Math.min(1, a));
	ctx.textAlign = 'center';

	// Panel
	const w = 230;
	const x = (VIEW_W - w) / 2;
	roundedRect(ctx, x, 96, w, 48, 10);
	ctx.fillStyle = hexA(color, 0.14);
	ctx.fill();
	ctx.strokeStyle = hexA(color, 0.8);
	ctx.lineWidth = 1.5;
	ctx.stroke();

	ctx.shadowColor = color;
	ctx.shadowBlur = 10;
	ctx.fillStyle = color;
	ctx.font = 'bold 14px monospace';
	ctx.fillText('◆ ' + name + ' ◆', VIEW_W / 2, 118);
	ctx.shadowBlur = 0;
	ctx.fillStyle = 'rgba(255,255,255,0.75)';
	ctx.font = '8px monospace';
	ctx.fillText('S P E L L   C A R D', VIEW_W / 2, 134);
	ctx.restore();
}

export function drawPerfect(
	ctx: CanvasRenderingContext2D,
	timer: number,
): void {
	const a = timer < 30 ? timer / 30 : 1;
	ctx.save();
	ctx.globalAlpha = Math.max(0, Math.min(1, a));
	ctx.textAlign = 'center';
	ctx.shadowColor = '#ffe080';
	ctx.shadowBlur = 12;
	ctx.fillStyle = '#ffe080';
	ctx.font = 'bold 16px monospace';
	ctx.fillText('PERFECT!', VIEW_W / 2, 160);
	ctx.shadowBlur = 0;
	ctx.restore();
}
