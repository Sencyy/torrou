import { VIEW_H, VIEW_W } from './config';
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
			for (let i = 0; i < 40; i++) {
				this.blobs.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					r: 1 + Math.random() * 3,
					sp: 0.3 + Math.random() * 0.6,
				});
			}
		} else if (this.theme === 'cave') {
			for (let i = 0; i < 26; i++) {
				this.blobs.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					r: 1 + Math.random() * 2,
					sp: 0.2 + Math.random() * 0.4,
				});
			}
		} else {
			for (let i = 0; i < 70; i++) {
				this.stars.push({
					x: Math.random() * VIEW_W,
					y: Math.random() * VIEW_H,
					s: 1 + Math.random() * 1.5,
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
		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#06283a');
		g.addColorStop(0.5, '#0a4a5e');
		g.addColorStop(1, '#0e6a72');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// Waves
		ctx.strokeStyle = 'rgba(180, 230, 255, 0.18)';
		ctx.lineWidth = 2;
		for (let row = 0; row < 8; row++) {
			const baseY = ((this.frame * 0.6 + row * 70) % (VIEW_H + 60)) - 30;
			ctx.beginPath();
			for (let x = 0; x <= VIEW_W; x += 8) {
				const y = baseY + Math.sin(x * 0.05 + this.frame * 0.03 + row) * 6;
				if (x === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}

		// Bubbles
		ctx.fillStyle = 'rgba(220, 245, 255, 0.5)';
		for (const b of this.blobs) {
			b.y -= b.sp;
			if (b.y < -5) {
				b.y = VIEW_H + 5;
				b.x = Math.random() * VIEW_W;
			}
			ctx.beginPath();
			ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	private drawCave(ctx: CanvasRenderingContext2D): void {
		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#160a24');
		g.addColorStop(0.6, '#241038');
		g.addColorStop(1, '#301a44');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// Stalactites
		ctx.fillStyle = 'rgba(10, 4, 20, 0.85)';
		for (let i = 0; i < 9; i++) {
			const x = i * 40 + 10;
			const h = 30 + ((i * 37) % 40);
			ctx.beginPath();
			ctx.moveTo(x - 18, 0);
			ctx.lineTo(x + 18, 0);
			ctx.lineTo(x, h);
			ctx.closePath();
			ctx.fill();
		}

		// Glowing crystals
		for (let i = 0; i < 7; i++) {
			const x = (i * 53 + 20) % VIEW_W;
			const y = 120 + ((i * 91) % (VIEW_H - 200));
			const pulse = 0.5 + 0.5 * Math.sin(this.frame * 0.05 + i);
			ctx.fillStyle = `rgba(150, 220, 255, ${0.25 + pulse * 0.4})`;
			ctx.beginPath();
			ctx.moveTo(x, y - 8);
			ctx.lineTo(x + 5, y);
			ctx.lineTo(x, y + 8);
			ctx.lineTo(x - 5, y);
			ctx.closePath();
			ctx.fill();
		}

		// Dust
		ctx.fillStyle = 'rgba(200, 160, 255, 0.4)';
		for (const b of this.blobs) {
			b.y += b.sp;
			if (b.y > VIEW_H + 5) {
				b.y = -5;
				b.x = Math.random() * VIEW_W;
			}
			ctx.fillRect(b.x, b.y, b.r, b.r);
		}
	}

	private drawMoon(ctx: CanvasRenderingContext2D): void {
		const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
		g.addColorStop(0, '#050818');
		g.addColorStop(0.6, '#0a1030');
		g.addColorStop(1, '#141a3e');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);

		// Stars
		for (const s of this.stars) {
			const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.frame * 0.03 * s.sp + s.x));
			ctx.fillStyle = `rgba(255, 255, 255, ${tw})`;
			ctx.fillRect(s.x, s.y, s.s, s.s);
		}

		// Moon
		const mx = VIEW_W - 80;
		const my = 90;
		const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 60);
		mg.addColorStop(0, 'rgba(255, 250, 230, 0.95)');
		mg.addColorStop(0.5, 'rgba(230, 220, 190, 0.5)');
		mg.addColorStop(1, 'rgba(230, 220, 190, 0)');
		ctx.fillStyle = mg;
		ctx.beginPath();
		ctx.arc(mx, my, 60, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#f5efd8';
		ctx.beginPath();
		ctx.arc(mx, my, 34, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = 'rgba(200, 190, 160, 0.5)';
		ctx.beginPath();
		ctx.arc(mx - 10, my - 6, 6, 0, Math.PI * 2);
		ctx.arc(mx + 12, my + 8, 4, 0, Math.PI * 2);
		ctx.fill();

		// Palace silhouette
		ctx.fillStyle = 'rgba(8, 10, 26, 0.9)';
		const py = VIEW_H - 60;
		ctx.beginPath();
		ctx.moveTo(0, VIEW_H);
		ctx.lineTo(0, py + 20);
		ctx.lineTo(40, py + 20);
		ctx.lineTo(60, py - 10);
		ctx.lineTo(90, py - 10);
		ctx.lineTo(110, py + 15);
		ctx.lineTo(160, py + 15);
		ctx.lineTo(180, py - 25);
		ctx.lineTo(210, py - 25);
		ctx.lineTo(230, py + 15);
		ctx.lineTo(280, py + 15);
		ctx.lineTo(300, py - 5);
		ctx.lineTo(VIEW_W, py + 20);
		ctx.lineTo(VIEW_W, VIEW_H);
		ctx.closePath();
		ctx.fill();

		// Drifting petals
		for (let i = 0; i < 14; i++) {
			const px = ((i * 47 + this.frame * 0.4) % (VIEW_W + 20)) - 10;
			const pyy = ((i * 83 + this.frame * 0.8) % (VIEW_H + 20)) - 10;
			ctx.fillStyle = 'rgba(255, 190, 210, 0.5)';
			ctx.beginPath();
			ctx.ellipse(px, pyy, 3, 1.6, this.frame * 0.02 + i, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}
