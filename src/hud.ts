import { VIEW_H, VIEW_W } from './config';

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

	// Top bar background
	ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
	ctx.fillRect(0, 0, VIEW_W, 22);

	// Lives
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'left';
	ctx.fillText('LV', 6, 4);
	for (let i = 0; i < Math.max(0, d.lives); i++) {
		ctx.fillStyle = d.charColor;
		ctx.beginPath();
		ctx.moveTo(26 + i * 12, 5);
		ctx.lineTo(31 + i * 12, 12);
		ctx.lineTo(26 + i * 12, 12);
		ctx.closePath();
		ctx.fill();
	}

	// Bombs
	ctx.fillStyle = '#fff';
	ctx.fillText('BM', 6, 14);
	for (let i = 0; i < d.bombs; i++) {
		ctx.fillStyle = '#80c0ff';
		ctx.beginPath();
		ctx.arc(28 + i * 9, 17, 3, 0, Math.PI * 2);
		ctx.fill();
	}

	// Power
	ctx.fillStyle = '#ff8080';
	ctx.textAlign = 'left';
	ctx.fillText(`PWR ${d.power}`, 60, 4);
	ctx.fillStyle = '#ffe080';
	ctx.fillText(`ITM ${d.itemRank}`, 60, 14);

	// Score
	ctx.textAlign = 'right';
	ctx.fillStyle = '#fff';
	ctx.fillText(`SCORE ${d.score}`, VIEW_W - 6, 4);
	ctx.fillStyle = '#ffe080';
	ctx.fillText(`HI ${d.hiScore}`, VIEW_W - 6, 14);

	// Focus meter (bottom)
	const fw = 120;
	const fx = (VIEW_W - fw) / 2;
	const fy = VIEW_H - 14;
	ctx.fillStyle = 'rgba(0,0,0,0.5)';
	ctx.fillRect(fx, fy, fw, 5);
	const frac = d.focus / d.focusMax;
	ctx.fillStyle = frac > 0.3 ? '#7ad0ff' : '#ff8080';
	ctx.fillRect(fx, fy, fw * frac, 5);
	ctx.strokeStyle = 'rgba(255,255,255,0.4)';
	ctx.strokeRect(fx, fy, fw, 5);

	// Fairy mood (bottom right)
	if (d.fairyActive) {
		ctx.textAlign = 'right';
		ctx.fillStyle = '#bfe8ff';
		ctx.font = '9px monospace';
		ctx.fillText('FAIRY', VIEW_W - 6, fy - 12);
		const mw = 40;
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(VIEW_W - 6 - mw, fy - 2, mw, 4);
		ctx.fillStyle = d.fairyMood > 40 ? '#bfe8ff' : '#ff9090';
		ctx.fillRect(VIEW_W - 6 - mw, fy - 2, (mw * d.fairyMood) / 100, 4);
	}

	// Stage label (top center)
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgba(255,255,255,0.85)';
	ctx.font = '9px monospace';
	ctx.fillText(`STAGE ${d.stageIndex + 1}/${d.stageCount}  ${d.stageName}`, VIEW_W / 2, 24);
	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.fillText(`${d.charName}  ·  ${d.diffLabel}`, VIEW_W / 2, 35);

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
	ctx.fillStyle = color;
	ctx.font = 'bold 14px monospace';
	ctx.fillText('◆ ' + name + ' ◆', VIEW_W / 2, 120);
	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.font = '9px monospace';
	ctx.fillText('SPELL CARD', VIEW_W / 2, 136);
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
	ctx.fillStyle = '#ffe080';
	ctx.font = 'bold 16px monospace';
	ctx.fillText('PERFECT!', VIEW_W / 2, 160);
	ctx.restore();
}
