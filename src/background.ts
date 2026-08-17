import { VIEW_H, VIEW_W } from './config';
import { glowCircle, hexA, sparkle } from './gfx';
import type { StageTheme } from './types';

interface Star {
	x: number;
	y: number;
	s: number;
	sp: number;
}

interface Blob {
	x: number;
	y: number;
	r: number;
	sp: number;
}

export class Background {
	theme: StageTheme;
	frame = 0;
	private stars: Star[] = [];
	private blobs: Blob[] = [];

	constructor(theme: StageTheme) {
		this.theme = theme;
		this.init();
	}

	private init(): void {
		this.stars = [];
		this.blobs = [];
		if (this.theme === 'sea') {
			for (let i = 0; i < 42; i++) {
				this.blobs.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					r: 0.8 + Math.random() * 2.6,
					sp: 0.35 + Math.random() * 0.7,
				});
			}
		} else if (this.theme === 'cave') {
			for (let i = 0; i < 30; i++) {
				this.blobs.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					r: 0.8 + Math.random() * 1.8,
					sp: 0.15 + Math.random() * 0.35,
				});
			}
		} else {
			for (let i = 0; i < 70; i++) {
				this.stars.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					s: 1 + Math.random() * 1.6,
					sp: 0.5 + Math.random() * 2,
				});
			}
		}
	}

	update(): void {
		this.frame++;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		switch (this.theme) {
			case 'sea':
				this.drawSea(ctx);
				break;
			case 'cave':
				this.drawCave(ctx);
				break;
			case 'moon':
				this.drawMoon(ctx);
				break;
		}
	}

	private drawSea(ctx: CanvasRenderingContext2D): void {
		const t = this.frame;

		// Water gradient, brighter toward the surface glow below
		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#04263a');
		g.addColorStop(0.45, '#0a5568');
		g.addColorStop(1, '#10828a');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// God rays from the surface
		ctx.save();
		for (let i = 0; i < 5; i++) {
			const bx = 30 + i * 70 + Math.sin(t * 0.006 + i * 1.7) * 18;
			const wTop = 10 + (i % 2) * 8;
			const wBot = 46 + (i % 3) * 14;
			const a = 0.05 + 0.03 * Math.sin(t * 0.012 + i * 2.1);
			const rg = ctx.createLinearGradient(0, 0, 0, VIEW_H * 0.85);
			rg.addColorStop(0, hexA('#bfefff', a * 1.6));
			rg.addColorStop(1, hexA('#bfefff', 0));
			ctx.fillStyle = rg;
			ctx.beginPath();
			ctx.moveTo(bx - wTop, -4);
			ctx.lineTo(bx + wTop, -4);
			ctx.lineTo(bx + wBot + 26, VIEW_H * 0.85);
			ctx.lineTo(bx - wBot + 26, VIEW_H * 0.85);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();

		// Surface shimmer at the top
		const sg = ctx.createLinearGradient(0, 0, 0, 46);
		sg.addColorStop(0, 'rgba(210, 245, 255, 0.28)');
		sg.addColorStop(1, 'rgba(210, 245, 255, 0)');
		ctx.fillStyle = sg;
		ctx.fillRect(0, 0, VIEW_W, 46);

		// Caustic light bands (lower half)
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		for (let row = 0; row < 4; row++) {
			const baseY = VIEW_H * 0.55 + row * 52 + Math.sin(t * 0.02 + row) * 6;
			ctx.strokeStyle = `rgba(190, 240, 255, ${0.05 + 0.03 * Math.sin(t * 0.03 + row * 2)})`;
			ctx.lineWidth = 5;
			ctx.beginPath();
			for (let x = 0; x <= VIEW_W; x += 10) {
				const y = baseY + Math.sin(x * 0.06 + t * 0.03 + row * 1.4) * 7;
				if (x === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
		ctx.restore();

		// Bubbles with glow
		for (const b of this.blobs) {
			b.y -= b.sp;
			b.x += Math.sin(t * 0.04 + b.y * 0.05) * 0.2;
			if (b.y < -6) {
				b.y = VIEW_H + 6;
				b.x = Math.random() * VIEW_W;
			}
			glowCircle(ctx, b.x, b.y, b.r * 2.6, '#cfeeff', 0.22);
			ctx.fillStyle = 'rgba(225, 248, 255, 0.55)';
			ctx.beginPath();
			ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
			ctx.fill();
			// Highlight
			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
			ctx.beginPath();
			ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	private drawCave(ctx: CanvasRenderingContext2D): void {
		const t = this.frame;

		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#140a26');
		g.addColorStop(0.6, '#241244');
		g.addColorStop(1, '#34205c');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// Distant rock silhouettes (bottom)
		ctx.fillStyle = 'rgba(10, 4, 22, 0.85)';
		ctx.beginPath();
		ctx.moveTo(0, VIEW_H);
		ctx.lineTo(0, VIEW_H - 46);
		ctx.quadraticCurveTo(50, VIEW_H - 84, 110, VIEW_H - 40);
		ctx.quadraticCurveTo(170, VIEW_H - 8, 230, VIEW_H - 56);
		ctx.quadraticCurveTo(280, VIEW_H - 92, VIEW_W, VIEW_H - 34);
		ctx.lineTo(VIEW_W, VIEW_H);
		ctx.closePath();
		ctx.fill();

		// Stalactites (top), shaded
		for (let i = 0; i < 9; i++) {
			const x = i * 40 + 14;
			const h = 34 + ((i * 37) % 44);
			const sg = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
			sg.addColorStop(0, 'rgba(8, 3, 18, 0.95)');
			sg.addColorStop(0.5, 'rgba(26, 12, 44, 0.95)');
			sg.addColorStop(1, 'rgba(8, 3, 18, 0.95)');
			ctx.fillStyle = sg;
			ctx.beginPath();
			ctx.moveTo(x - 18, 0);
			ctx.quadraticCurveTo(x - 10, h * 0.5, x, h);
			ctx.quadraticCurveTo(x + 10, h * 0.5, x + 18, 0);
			ctx.closePath();
			ctx.fill();
		}

		// Glowing crystals (diamonds with pulsing halos)
		const crystalColors = ['#7ad0ff', '#c090ff', '#7affd8', '#ff9ad0'];
		for (let i = 0; i < 8; i++) {
			const x = (i * 53 + 24) % VIEW_W;
			const y = 110 + ((i * 91) % (VIEW_H - 220));
			const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i * 1.3);
			const color = crystalColors[i % crystalColors.length];
			const s = 5 + (i % 3) * 2;
			glowCircle(ctx, x, y, s * 3.2, color, 0.16 + pulse * 0.22);
			ctx.fillStyle = hexA(color, 0.55 + pulse * 0.35);
			ctx.beginPath();
			ctx.moveTo(x, y - s * 1.4);
			ctx.lineTo(x + s * 0.7, y);
			ctx.lineTo(x, y + s * 1.4);
			ctx.lineTo(x - s * 0.7, y);
			ctx.closePath();
			ctx.fill();
			// Inner core
			ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
			ctx.beginPath();
			ctx.moveTo(x, y - s * 0.6);
			ctx.lineTo(x + s * 0.3, y);
			ctx.lineTo(x, y + s * 0.6);
			ctx.lineTo(x - s * 0.3, y);
			ctx.closePath();
			ctx.fill();
		}

		// Drifting fog banks
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		for (let i = 0; i < 3; i++) {
			const fy = 150 + i * 120 + Math.sin(t * 0.008 + i * 2) * 12;
			const fx = ((t * (0.12 + i * 0.05) + i * 140) % (VIEW_W + 260)) - 130;
			const fg = ctx.createRadialGradient(fx, fy, 10, fx, fy, 130);
			fg.addColorStop(0, 'rgba(190, 150, 255, 0.07)');
			fg.addColorStop(1, 'rgba(190, 150, 255, 0)');
			ctx.fillStyle = fg;
			ctx.beginPath();
			ctx.ellipse(fx, fy, 130, 44, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

		// Dust motes
		for (const b of this.blobs) {
			b.y += b.sp;
			b.x += Math.sin(t * 0.03 + b.y * 0.04) * 0.15;
			if (b.y > VIEW_H + 5) {
				b.y = -5;
				b.x = Math.random() * VIEW_W;
			}
			const tw = 0.25 + 0.3 * Math.abs(Math.sin(t * 0.04 + b.x));
			ctx.fillStyle = `rgba(210, 170, 255, ${tw})`;
			ctx.fillRect(b.x, b.y, b.r, b.r);
		}
	}

	private drawMoon(ctx: CanvasRenderingContext2D): void {
		const t = this.frame;

		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#05081c');
		g.addColorStop(0.6, '#0b1234');
		g.addColorStop(1, '#182050');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// Twinkling stars + occasional sparkles
		for (let i = 0; i < this.stars.length; i++) {
			const s = this.stars[i];
			const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.03 * s.sp + s.x));
			ctx.fillStyle = `rgba(255, 255, 255, ${tw})`;
			ctx.fillRect(s.x, s.y, s.s, s.s);
			if (i % 12 === 0) {
				sparkle(ctx, s.x, s.y, 3.2, '#fff', tw * 0.5);
			}
		}

		// Moon with halo
		const mx = VIEW_W - 78;
		const my = 88;
		glowCircle(ctx, mx, my, 74, '#fff6d8', 0.5);
		const mg = ctx.createRadialGradient(mx - 8, my - 8, 6, mx, my, 34);
		mg.addColorStop(0, '#fffdf0');
		mg.addColorStop(1, '#e8ddba');
		ctx.fillStyle = mg;
		ctx.beginPath();
		ctx.arc(mx, my, 34, 0, Math.PI * 2);
		ctx.fill();
		// Craters
		ctx.fillStyle = 'rgba(190, 178, 145, 0.55)';
		ctx.beginPath();
		ctx.arc(mx - 11, my - 6, 6, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(mx + 12, my + 9, 4.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(mx + 4, my - 14, 3, 0, Math.PI * 2);
		ctx.fill();

		// Soft moonbeam toward the palace
		const bg = ctx.createLinearGradient(mx, my, 40, VIEW_H);
		bg.addColorStop(0, 'rgba(255, 248, 215, 0.16)');
		bg.addColorStop(1, 'rgba(255, 248, 215, 0)');
		ctx.fillStyle = bg;
		ctx.beginPath();
		ctx.moveTo(mx - 20, my + 20);
		ctx.lineTo(mx + 20, my + 20);
		ctx.lineTo(120, VIEW_H);
		ctx.lineTo(-40, VIEW_H);
		ctx.closePath();
		ctx.fill();

		// Moonlit palace silhouette (curved roofs)
		const py = VIEW_H - 58;
		ctx.fillStyle = 'rgba(7, 9, 24, 0.95)';
		ctx.beginPath();
		ctx.moveTo(0, VIEW_H);
		ctx.lineTo(0, py + 26);
		// Left wing roof
		ctx.lineTo(18, py + 26);
		ctx.quadraticCurveTo(34, py - 6, 52, py - 2);
		ctx.quadraticCurveTo(60, py - 1, 66, py + 12);
		ctx.lineTo(96, py + 12);
		// Main hall roof
		ctx.lineTo(104, py + 12);
		ctx.quadraticCurveTo(128, py - 34, 160, py - 36);
		ctx.quadraticCurveTo(192, py - 34, 216, py + 12);
		ctx.lineTo(224, py + 12);
		// Right wing roof
		ctx.lineTo(232, py + 12);
		ctx.quadraticCurveTo(238, py - 1, 246, py - 2);
		ctx.quadraticCurveTo(264, py - 6, 280, py + 26);
		ctx.lineTo(VIEW_W, py + 26);
		ctx.lineTo(VIEW_W, VIEW_H);
		ctx.closePath();
		ctx.fill();

		// Lit windows (flickering amber)
		for (let i = 0; i < 7; i++) {
			const wx = 40 + i * 38 + ((i * 13) % 10);
			const wy = py + 30 + ((i * 7) % 14);
			const fl = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.05 + i * 1.9));
			ctx.fillStyle = `rgba(255, 200, 110, ${fl * 0.85})`;
			ctx.fillRect(wx, wy, 5, 7);
			glowCircle(ctx, wx + 2.5, wy + 3.5, 8, '#ffc86e', fl * 0.25);
		}

		// Drifting cherry petals
		for (let i = 0; i < 14; i++) {
			const px = ((i * 47 + t * 0.45) % (VIEW_W + 20)) - 10;
			const pyy = ((i * 83 + t * 0.85) % (VIEW_H + 20)) - 10;
			ctx.save();
			ctx.translate(px, pyy);
			ctx.rotate(t * 0.025 + i);
			ctx.fillStyle = 'rgba(255, 195, 215, 0.55)';
			ctx.beginPath();
			ctx.ellipse(0, 0, 3, 1.6, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}
}
