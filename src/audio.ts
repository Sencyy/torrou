export type SfxName =
	| 'shot'
	| 'bomb'
	| 'hit'
	| 'pickup'
	| 'spellcard'
	| 'kill'
	| 'stageclear'
	| 'gameover'
	| 'select'
	| 'swap';

export class AudioSys {
	private ctx: AudioContext | null = null;
	muted = false;

	private ensure(): AudioContext | null {
		if (!this.ctx) {
			try {
				this.ctx = new AudioContext();
			} catch {
				return null;
			}
		}
		if (this.ctx.state === 'suspended') void this.ctx.resume();
		return this.ctx;
	}

	setMuted(m: boolean): void {
		this.muted = m;
	}

	private tone(
		freq: number,
		dur: number,
		type: OscillatorType,
		gain: number,
		delay = 0,
		slideTo?: number,
	): void {
		const ctx = this.ensure();
		if (!ctx) return;
		const t0 = ctx.currentTime + delay;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, t0);
		if (slideTo !== undefined) {
			osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
		}
		g.gain.setValueAtTime(gain, t0);
		g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
		osc.connect(g).connect(ctx.destination);
		osc.start(t0);
		osc.stop(t0 + dur + 0.02);
	}

	private noise(dur: number, gain: number, delay = 0, lowpass = 1200): void {
		const ctx = this.ensure();
		if (!ctx) return;
		const t0 = ctx.currentTime + delay;
		const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
		const buf = ctx.createBuffer(1, len, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		const src = ctx.createBufferSource();
		src.buffer = buf;
		const filter = ctx.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.value = lowpass;
		const g = ctx.createGain();
		g.gain.setValueAtTime(gain, t0);
		g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
		src.connect(filter).connect(g).connect(ctx.destination);
		src.start(t0);
		src.stop(t0 + dur + 0.02);
	}

	play(name: SfxName): void {
		if (this.muted) return;
		switch (name) {
			case 'shot':
				this.tone(880, 0.04, 'square', 0.02, 0, 660);
				break;
			case 'bomb':
				this.noise(0.5, 0.25, 0, 900);
				this.tone(220, 0.5, 'sine', 0.2, 0, 40);
				break;
			case 'hit':
				this.tone(400, 0.3, 'sawtooth', 0.18, 0, 60);
				this.noise(0.2, 0.15);
				break;
			case 'pickup':
				this.tone(660, 0.06, 'sine', 0.08);
				this.tone(990, 0.08, 'sine', 0.08, 0.05);
				break;
			case 'spellcard':
				this.tone(523, 0.12, 'triangle', 0.15);
				this.tone(659, 0.12, 'triangle', 0.15, 0.08);
				this.tone(784, 0.2, 'triangle', 0.15, 0.16);
				this.tone(1046, 0.3, 'triangle', 0.12, 0.24);
				break;
			case 'kill':
				this.noise(0.08, 0.1, 0, 2000);
				this.tone(300, 0.08, 'square', 0.06, 0, 150);
				break;
			case 'stageclear':
				[523, 659, 784, 1046, 1318].forEach((f, i) =>
					this.tone(f, 0.15, 'triangle', 0.12, i * 0.09),
				);
				break;
			case 'gameover':
				[392, 330, 262, 196].forEach((f, i) =>
					this.tone(f, 0.3, 'triangle', 0.14, i * 0.22),
				);
				break;
			case 'select':
				this.tone(740, 0.05, 'square', 0.06);
				break;
			case 'swap':
				this.tone(520, 0.05, 'sine', 0.07);
				this.tone(780, 0.07, 'sine', 0.07, 0.04);
				break;
		}
	}
}
