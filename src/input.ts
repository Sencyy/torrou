export class Input {
	private down = new Set<string>();
	private pressed = new Set<string>();

	attach(): void {
		window.addEventListener('keydown', (e) => {
			if (
				e.code === 'Space' ||
				e.code.startsWith('Arrow') ||
				e.code === 'Tab'
			) {
				e.preventDefault();
			}
			if (!this.down.has(e.code)) this.pressed.add(e.code);
			this.down.add(e.code);
		});
		window.addEventListener('keyup', (e) => {
			this.down.delete(e.code);
		});
		window.addEventListener('blur', () => {
			this.down.clear();
			this.pressed.clear();
		});
	}

	isDown(...codes: string[]): boolean {
		return codes.some((c) => this.down.has(c));
	}

	wasPressed(...codes: string[]): boolean {
		return codes.some((c) => this.pressed.has(c));
	}

	endFrame(): void {
		this.pressed.clear();
	}
}

export const KEYS = {
	left: ['ArrowLeft', 'KeyA'],
	right: ['ArrowRight', 'KeyD'],
	up: ['ArrowUp', 'KeyW'],
	down: ['ArrowDown', 'KeyS'],
	shoot: ['Space', 'KeyZ', 'KeyJ'],
	bomb: ['KeyX', 'KeyK', 'ControlLeft'],
	focus: ['ShiftLeft', 'ShiftRight'],
	swap: ['KeyC', 'KeyL'],
	confirm: ['Enter', 'Space'],
	back: ['Escape', 'KeyB'],
	mute: ['KeyM'],
};
