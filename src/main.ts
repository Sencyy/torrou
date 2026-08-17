import { AudioSys } from './audio';
import { drawWindowBackdrop } from './backdrop';
import { FRAME_MS, VIEW_H, VIEW_W } from './config';
import { Game } from './game';
import { Input } from './input';
import { MusicSys } from './music';

function main(): void {
	const container = document.getElementById('game');
	if (!container) throw new Error('missing #game element');

	const canvas = document.createElement('canvas');
	container.appendChild(canvas);

	const maybeCtx = canvas.getContext('2d');
	if (!maybeCtx) throw new Error('no 2d context');
	const ctx: CanvasRenderingContext2D = maybeCtx;
	ctx.imageSmoothingEnabled = false;

	let dpr = 1;
	let vw = 0;
	let vh = 0;

	function resize(): void {
		dpr = window.devicePixelRatio || 1;
		vw = window.innerWidth;
		vh = window.innerHeight;
		canvas.width = Math.max(1, Math.floor(vw * dpr));
		canvas.height = Math.max(1, Math.floor(vh * dpr));
		canvas.style.width = `${vw}px`;
		canvas.style.height = `${vh}px`;
	}
	window.addEventListener('resize', resize);
	resize();

	const input = new Input();
	input.attach();
	const audio = new AudioSys();
	const music = new MusicSys();
	const game = new Game(input, audio, music);

	// Browsers block audio until the first user gesture.
	const unlock = (): void => {
		music.unlock();
		window.removeEventListener('keydown', unlock);
		window.removeEventListener('mousedown', unlock);
		window.removeEventListener('pointerdown', unlock);
	};
	window.addEventListener('keydown', unlock);
	window.addEventListener('mousedown', unlock);
	window.addEventListener('pointerdown', unlock);

	function renderFrame(): void {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Full-window themed backdrop
		drawWindowBackdrop(ctx, game.backdropTheme, vw, vh, game.frame);

		// Centered 320x480 playfield, scaled to fit
		const s = Math.min(vw / VIEW_W, vh / VIEW_H);
		const ox = (vw - VIEW_W * s) / 2;
		const oy = (vh - VIEW_H * s) / 2;
		ctx.save();
		ctx.translate(ox, oy);
		ctx.scale(s, s);
		game.render(ctx);
		ctx.restore();

		// Playfield frame
		ctx.strokeStyle = 'rgba(255, 235, 200, 0.28)';
		ctx.lineWidth = 1;
		ctx.strokeRect(ox - 1.5, oy - 1.5, VIEW_W * s + 3, VIEW_H * s + 3);
		const cl = 14;
		ctx.strokeStyle = 'rgba(255, 235, 200, 0.7)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(ox - 1.5, oy - 1.5 + cl);
		ctx.lineTo(ox - 1.5, oy - 1.5);
		ctx.lineTo(ox - 1.5 + cl, oy - 1.5);
		ctx.moveTo(ox - 1.5 + VIEW_W * s + 1.5 - cl, oy - 1.5);
		ctx.lineTo(ox - 1.5 + VIEW_W * s + 1.5, oy - 1.5);
		ctx.lineTo(ox - 1.5 + VIEW_W * s + 1.5, oy - 1.5 + cl);
		ctx.moveTo(ox - 1.5 + VIEW_W * s + 1.5, oy - 1.5 + VIEW_H * s + 1.5 - cl);
		ctx.lineTo(ox - 1.5 + VIEW_W * s + 1.5, oy - 1.5 + VIEW_H * s + 1.5);
		ctx.lineTo(ox - 1.5 + VIEW_W * s + 1.5 - cl, oy - 1.5 + VIEW_H * s + 1.5);
		ctx.moveTo(ox - 1.5 + cl, oy - 1.5 + VIEW_H * s + 1.5);
		ctx.lineTo(ox - 1.5, oy - 1.5 + VIEW_H * s + 1.5);
		ctx.lineTo(ox - 1.5, oy - 1.5 + VIEW_H * s + 1.5 - cl);
		ctx.stroke();
	}

	let last = performance.now();
	let acc = 0;

	function loop(now: number): void {
		let dt = now - last;
		last = now;
		if (dt > 200) dt = 200;
		acc += dt;
		while (acc >= FRAME_MS) {
			game.update();
			acc -= FRAME_MS;
		}
		renderFrame();
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}

main();
