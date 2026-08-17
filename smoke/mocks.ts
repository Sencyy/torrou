// DOM/browser mocks for headless smoke test. Must be imported first.
const listeners: Record<string, ((e: { code: string; preventDefault?: () => void }) => void)[]> = {};

(globalThis as Record<string, unknown>).window = {
	addEventListener: (t: string, fn: (e: { code: string; preventDefault?: () => void }) => void) => {
		(listeners[t] ||= []).push(fn);
	},
	removeEventListener: (t: string, fn: (e: { code: string; preventDefault?: () => void }) => void) => {
		listeners[t] = (listeners[t] || []).filter((f) => f !== fn);
	},
	innerWidth: 640,
	innerHeight: 960,
	devicePixelRatio: 1,
	setInterval: (fn: () => void, ms: number) => {
		const id = setInterval(fn, ms);
		(id as unknown as { unref?: () => void }).unref?.();
		return id as unknown as number;
	},
	clearInterval: (id: number) => clearInterval(id as unknown as ReturnType<typeof setInterval>),
};

(globalThis as Record<string, unknown>).document = {
	getElementById: () => null,
	createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => null }),
};

const store: Record<string, string> = {};
(globalThis as Record<string, unknown>).localStorage = {
	getItem: (k: string) => (k in store ? store[k] : null),
	setItem: (k: string, v: string) => {
		store[k] = String(v);
	},
};

class FakeParam {
	value = 0;
	setValueAtTime(): void {}
	exponentialRampToValueAtTime(): void {}
}
class FakeOsc {
	type = 'sine';
	frequency = new FakeParam();
	connect(): this {
		return this;
	}
	start(): void {}
	stop(): void {}
}
class FakeGain {
	gain = new FakeParam();
	connect(): this {
		return this;
	}
}
class FakeFilter {
	type = 'lowpass';
	frequency = new FakeParam();
	connect(): this {
		return this;
	}
}
class FakeSrc {
	buffer: unknown = null;
	connect(): this {
		return this;
	}
	start(): void {}
	stop(): void {}
}

(globalThis as Record<string, unknown>).AudioContext = class {
	currentTime = 0;
	sampleRate = 44100;
	state = 'running';
	destination: unknown = {};
	resume(): Promise<void> {
		return Promise.resolve();
	}
	createOscillator(): FakeOsc {
		return new FakeOsc();
	}
	createGain(): FakeGain {
		return new FakeGain();
	}
	createBiquadFilter(): FakeFilter {
		return new FakeFilter();
	}
	createBufferSource(): FakeSrc {
		return new FakeSrc();
	}
	createBuffer(_n: number, len: number): { getChannelData: () => Float32Array } {
		return { getChannelData: () => new Float32Array(len) };
	}
};

(globalThis as Record<string, unknown>).performance = { now: () => Date.now() };
(globalThis as Record<string, unknown>).requestAnimationFrame = () => 0;

export function press(code: string): void {
	listeners['keydown']?.forEach((f) => f({ code, preventDefault: () => {} }));
}
export function release(code: string): void {
	listeners['keyup']?.forEach((f) => f({ code }));
}
