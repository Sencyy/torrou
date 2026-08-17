import { AudioSys } from './audio';
import { FRAME_MS, VIEW_H, VIEW_W } from './config';
import { Game } from './game';
import { Input } from './input';

function main(): void {
	const container = document.getElementById('game');
	if (!container) throw new Error('missing #game element');

	const canvas = document.createElement('canvas');
	canvas.width = VIEW_W;
	canvas.height = VIEW_H;
	container.appendChild(canvas);

	const maybeCtx = canvas.getContext('2d');
	if (!maybeCtx) throw new Error('no 2d context');
	const ctx: CanvasRenderingContext2D = maybeCtx;
	ctx.imageSmoothingEnabled = false;

	function resize(): void {
		const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
		const s = Math.max(1, Math.floor(scale));
		canvas.style.width = `${VIEW_W * s}px`;
		canvas.style.height = `${VIEW_H * s}px`;
	}
	window.addEventListener('resize', resize);
	resize();

	const input = new Input();
	input.attach();
	const audio = new AudioSys();
	const game = new Game(input, audio);

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
		game.render(ctx);
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}

main();
