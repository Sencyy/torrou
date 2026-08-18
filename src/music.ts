// PC-98-era style chiptune/FM music engine (WebAudio).
// Title is a transcription of the Touhou 15 menu theme "The Space Shrine Maiden Appears"
// (Karl Zuñiga), melody one octave down; the other tracks are original FM compositions.

export type TrackName =
	| 'title'
	| 'stage1'
	| 'stage2'
	| 'stage3'
	| 'boss'
	| 'gameover'
	| 'win';

type InstName = 'lead' | 'bass' | 'arp' | 'pad' | 'square' | 'kick' | 'snare' | 'hat';

interface Ev {
	beat: number;
	len: number;
	midi: number;
	inst: InstName;
	vol: number;
}

interface Track {
	tempo: number;
	beats: number;
	events: Ev[];
}

// ---------- note helpers ----------
const SEMI: Record<string, number> = {
	C: 0, 'C#': 1, Db: 1,
	D: 2, 'D#': 3, Eb: 3,
	E: 4, F: 4,
	'F#': 5, Gb: 5,
	G: 6, 'G#': 7, Ab: 7,
	A: 8, 'A#': 9, Bb: 9,
	B: 10,
};

function midi(name: string, octave: number): number {
	return (octave + 1) * 12 + SEMI[name];
}

function freqOf(m: number): number {
	return 440 * Math.pow(2, (m - 69) / 12);
}

function chord(root: string, oct: number, type: 'maj' | 'min' | 'dom' | 'dim' | 'sus4'): number[] {
	const r = midi(root, oct);
	switch (type) {
		case 'maj': return [r, r + 4, r + 7];
		case 'min': return [r, r + 3, r + 7];
		case 'dom': return [r, r + 4, r + 7, r + 10];
		case 'dim': return [r, r + 3, r + 6];
		case 'sus4': return [r, r + 5, r + 7];
	}
}

// ---------- voices ----------
type Ctx = AudioContext;

function envGain(ctx: Ctx, t0: number, dur: number, vol: number, attack: number, decay: number, sustain: number, release: number): GainNode {
	const g = ctx.createGain();
	const a = Math.max(0.001, attack);
	const d = Math.max(0.001, decay);
	const sus = Math.max(0.0001, vol * sustain);
	const rel = Math.max(0.01, release);
	const body = Math.max(a + d + rel, dur * 0.5);
	g.gain.setValueAtTime(0.0001, t0);
	g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + a);
	g.gain.exponentialRampToValueAtTime(sus, t0 + a + d);
	g.gain.setValueAtTime(sus, Math.max(t0 + a + d, t0 + body));
	g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	return g;
}

function fmVoice(
	ctx: Ctx,
	dest: AudioNode,
	t0: number,
	freq: number,
	dur: number,
	vol: number,
	modRatio: number,
	modIndex: number,
	attack: number,
	decay: number,
	sustain: number,
	release: number,
): void {
	const carrier = ctx.createOscillator();
	carrier.type = 'sine';
	carrier.frequency.setValueAtTime(freq, t0);

	const mod = ctx.createOscillator();
	mod.type = 'sine';
	mod.frequency.setValueAtTime(freq * modRatio, t0);
	const modGain = ctx.createGain();
	modGain.gain.setValueAtTime(freq * modIndex, t0);
	modGain.gain.exponentialRampToValueAtTime(Math.max(1, freq * 0.02), t0 + Math.max(0.02, decay * 2));
	mod.connect(modGain);
	modGain.connect(carrier.frequency);

	const g = envGain(ctx, t0, dur, vol, attack, decay, sustain, release);
	carrier.connect(g);
	g.connect(dest);
	mod.start(t0);
	carrier.start(t0);
	mod.stop(t0 + dur + 0.02);
	carrier.stop(t0 + dur + 0.02);
}

function chipVoice(
	ctx: Ctx,
	dest: AudioNode,
	t0: number,
	freq: number,
	dur: number,
	vol: number,
	type: OscillatorType,
	attack: number,
	decay: number,
	sustain: number,
	release: number,
): void {
	const osc = ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	const g = envGain(ctx, t0, dur, vol, attack, decay, sustain, release);
	osc.connect(g);
	g.connect(dest);
	osc.start(t0);
	osc.stop(t0 + dur + 0.02);
}

function noiseVoice(ctx: Ctx, dest: AudioNode, t0: number, dur: number, vol: number, filterType: BiquadFilterType, filterFreq: number): void {
	const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
	const src = ctx.createBufferSource();
	src.buffer = buf;
	const filter = ctx.createBiquadFilter();
	filter.type = filterType;
	filter.frequency.value = filterFreq;
	const g = ctx.createGain();
	g.gain.setValueAtTime(vol, t0);
	g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	src.connect(filter);
	filter.connect(g);
	g.connect(dest);
	src.start(t0);
	src.stop(t0 + dur + 0.02);
}

function kickVoice(ctx: Ctx, dest: AudioNode, t0: number, vol: number): void {
	const osc = ctx.createOscillator();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(130, t0);
	osc.frequency.exponentialRampToValueAtTime(42, t0 + 0.12);
	const g = ctx.createGain();
	g.gain.setValueAtTime(vol, t0);
	g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
	osc.connect(g);
	g.connect(dest);
	osc.start(t0);
	osc.stop(t0 + 0.18);
}

function playEvent(ctx: Ctx, dest: AudioNode, ev: Ev, t0: number): void {
	if (ev.inst === 'kick') {
		kickVoice(ctx, dest, t0, ev.vol);
		return;
	}
	if (ev.inst === 'snare') {
		noiseVoice(ctx, dest, t0, 0.16, ev.vol, 'bandpass', 1800);
		chipVoice(ctx, dest, t0, 180, 0.12, ev.vol * 0.5, 'triangle', 0.002, 0.05, 0.3, 0.05);
		return;
	}
	if (ev.inst === 'hat') {
		noiseVoice(ctx, dest, t0, 0.05, ev.vol, 'highpass', 7000);
		return;
	}
	const f = freqOf(ev.midi);
	switch (ev.inst) {
		case 'lead':
			fmVoice(ctx, dest, t0, f, ev.len, ev.vol, 1, 1.6, 0.006, 0.18, 0.55, 0.08);
			break;
		case 'bass':
			fmVoice(ctx, dest, t0, f, ev.len, ev.vol, 1, 2.4, 0.004, 0.12, 0.5, 0.06);
			break;
		case 'arp':
			chipVoice(ctx, dest, t0, f, ev.len, ev.vol, 'square', 0.002, 0.09, 0.4, 0.04);
			break;
		case 'pad':
			chipVoice(ctx, dest, t0, f, ev.len, ev.vol, 'triangle', 0.06, 0.3, 0.8, 0.2);
			break;
		case 'square':
			chipVoice(ctx, dest, t0, f, ev.len, ev.vol, 'square', 0.004, 0.12, 0.5, 0.06);
			break;
	}
}

// ---------- track builder ----------
interface BuildOpts {
	tempo: number;
	bars: number;
	chords: number[][];
	melody?: Ev[];
	arpPattern?: 'up16' | 'up8' | 'down16' | 'none';
	arpVol?: number;
	padVol?: number;
	bassVol?: number;
	bassOct?: number;
	drums?: { kick?: number[]; snare?: number[]; hat?: number[] };
}

function mel(notes: [string, number, number, number][], inst: InstName = 'lead', vol = 0.3): Ev[] {
	return notes.map(([n, o, beat, len]) => ({ beat, len, midi: midi(n, o), inst, vol }));
}

function build(o: BuildOpts): Track {
	const events: Ev[] = [];
	const arpPattern = o.arpPattern ?? 'up16';
	const arpVol = o.arpVol ?? 0.16;
	const padVol = o.padVol ?? 0.11;
	const bassVol = o.bassVol ?? 0.3;
	const bassOct = o.bassOct ?? -12;

	for (let bar = 0; bar < o.bars; bar++) {
		const ch = o.chords[bar % o.chords.length];
		const bs = bar * 4;
		if (padVol > 0) for (const m of ch) events.push({ beat: bs, len: 4, midi: m, inst: 'pad', vol: padVol });
		if (arpPattern !== 'none') {
			const seq = arpPattern.startsWith('down') ? [...ch].reverse() : ch;
			const steps = arpPattern.endsWith('16') ? 16 : 8;
			const stepLen = 4 / steps;
			for (let s = 0; s < steps; s++) {
				events.push({ beat: bs + s * stepLen, len: stepLen * 0.85, midi: seq[s % seq.length], inst: 'arp', vol: arpVol });
			}
		}
		events.push({ beat: bs, len: 2, midi: ch[0] + bassOct, inst: 'bass', vol: bassVol });
		events.push({ beat: bs + 2, len: 2, midi: ch[0] + bassOct, inst: 'bass', vol: bassVol });
		const d = o.drums;
		if (d) {
			for (const b of d.kick ?? []) events.push({ beat: bs + b, len: 0.1, midi: 0, inst: 'kick', vol: 0.5 });
			for (const b of d.snare ?? []) events.push({ beat: bs + b, len: 0.15, midi: 0, inst: 'snare', vol: 0.35 });
			for (const b of d.hat ?? []) events.push({ beat: bs + b, len: 0.05, midi: 0, inst: 'hat', vol: 0.22 });
		}
	}
	if (o.melody) events.push(...o.melody);
	events.sort((a, b) => a.beat - b.beat);
	return { tempo: o.tempo, beats: o.bars * 4, events };
}

const H8 = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
const H16 = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75];

// ---------- title track: Touhou 15 menu theme "The Space Shrine Maiden Appears" (Karl Zuñiga) ----------
// Faithful transcription of the 96-beat verse, melody one octave down. Raw MIDI numbers are used
// directly so the values stay correct regardless of the SEMI table bug elsewhere in this file.
const TN: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const tm = (n: string, o: number): number => (o + 1) * 12 + TN[n];

function titleTrack(): Track {
  const ev: Ev[] = [];
  const push = (beat: number, len: number, midi: number, inst: InstName, vol: number): void => { ev.push({ beat, len, midi, inst, vol }); };

  // lead (hook): sparse 5-note 8th-note figure every 8 beats, one octave down
  const hk = [tm('D#', 3), tm('A#', 3), tm('G#', 3), tm('C#', 4)];
  const hkPeak = [tm('G#', 4), tm('F#', 4), tm('G#', 4), tm('F#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4), tm('G#', 4)];
  for (let m = 0; m < 12; m++) {
    const b = m * 8;
    push(b, 0.5, hk[0], 'lead', 0.3);
    push(b + 0.5, 0.5, hk[1], 'lead', 0.3);
    push(b + 1, 0.5, hk[2], 'lead', 0.3);
    push(b + 1.5, 0.5, hk[3], 'lead', 0.3);
    push(b + 2, 0.5, hkPeak[m], 'lead', 0.3);
  }
  push(12, 0.5, tm('G#', 4), 'lead', 0.3);
  push(14, 0.5, tm('F', 4), 'lead', 0.3);
  push(28, 0.5, tm('F#', 4), 'lead', 0.3);
  push(30, 0.5, tm('F', 4), 'lead', 0.3);

  // arp (piano melody): 16-note 8th-note pattern from b32, alternating A/B, one octave down
  const arpA = [51, 56, 58, 61, 58, 56, 51, 56, 58, 61, 58, 56, 51, 56, 58, 49];
  const arpB = [51, 56, 58, 61, 58, 56, 51, 56, 58, 61, 51, 56, 54, 53, 51, 49];
  for (let c = 0; c < 8; c++) {
    const b = 32 + c * 8;
    const pat = c % 2 === 0 ? arpA : arpB;
    for (let i = 0; i < 16; i++) push(b + i * 0.5, 0.5, pat[i], 'arp', 0.13);
  }

  // pad: sustained chords following the bass root, 8-beat holds
  const dsmaj = [tm('D#', 4), tm('F#', 4), tm('A#', 4)];
  const asmin = [tm('A#', 4), tm('C#', 5), tm('E', 5)];
  const padSeq = [dsmaj, asmin, dsmaj, asmin, dsmaj, dsmaj, dsmaj, dsmaj, dsmaj, dsmaj, dsmaj, dsmaj];
  for (let m = 0; m < 12; m++) for (const note of padSeq[m]) push(m * 8, 8, note, 'pad', 0.1);

  // bass: held roots + 8th-note figures in the intro, driving D#2 8ths in the main
  const figD = [tm('D#', 2), tm('A#', 2), tm('D#', 2), tm('G#', 2), tm('F#', 2), tm('F', 2), tm('D#', 2), tm('B', 1)];
  const figA = [tm('B', 1), tm('D#', 2), tm('B', 1), tm('D#', 2), tm('F#', 2), tm('G#', 2), tm('C#', 3), tm('G#', 2)];
  const bassFigures: [number, number[]][] = [[4, figD], [12, figA], [20, figD], [28, figA]];
  push(0, 4, tm('D#', 2), 'bass', 0.28);
  push(8, 4, tm('A#', 1), 'bass', 0.28);
  push(16, 4, tm('D#', 2), 'bass', 0.28);
  push(24, 4, tm('A#', 1), 'bass', 0.28);
  for (const [start, fig] of bassFigures) for (let i = 0; i < 8; i++) push(start + i * 0.5, 0.5, fig[i], 'bass', 0.28);
  for (let b = 32; b < 96; b += 0.5) push(b, 0.5, tm('D#', 2), 'bass', 0.28);

  // drums: light -> medium -> full build
  const hats = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
  for (let bar = 0; bar < 24; bar++) {
    const b = bar * 4;
    const kick = b < 16 ? [0, 2] : [0, 1.5, 2, 3.5];
    for (const k of kick) push(b + k, 0.1, 0, 'kick', 0.5);
    for (const h of hats) push(b + h, 0.05, 0, 'hat', 0.2);
    if (b >= 16 && b < 32) push(b + 2, 0.15, 0, 'snare', 0.35);
    if (b >= 32) { push(b + 1, 0.15, 0, 'snare', 0.35); push(b + 3, 0.15, 0, 'snare', 0.35); }
  }

  ev.sort((a, b) => a.beat - b.beat);
  return { tempo: 150, beats: 96, events: ev };
}

// ---------- the seven original tracks ----------
const TRACKS: Record<TrackName, Track> = {
	title: titleTrack(),

	stage1: build({
		tempo: 140,
		bars: 16,
		chords: [chord('C', 3, 'maj'), chord('G', 3, 'maj'), chord('A', 3, 'min'), chord('F', 3, 'maj')],
		arpPattern: 'up16',
		arpVol: 0.15,
		padVol: 0.09,
		bassVol: 0.3,
		drums: { kick: [0, 2], snare: [1, 3], hat: H8 },
		melody: mel([
			['E', 5, 0, 1], ['G', 5, 1, 1], ['C', 6, 2, 1], ['G', 5, 3, 1],
			['E', 5, 4, 1], ['C', 5, 5, 1], ['G', 4, 6, 1], ['C', 5, 7, 1],
			['A', 5, 8, 1], ['C', 6, 9, 1], ['E', 6, 10, 1], ['C', 6, 11, 1],
			['A', 5, 12, 1], ['F', 5, 13, 1], ['C', 5, 14, 1], ['F', 5, 15, 1],
			['E', 5, 16, 1], ['G', 5, 17, 1], ['C', 6, 18, 1], ['D', 6, 19, 1],
			['E', 6, 20, 1], ['D', 6, 21, 1], ['C', 6, 22, 1], ['G', 5, 23, 1],
			['A', 5, 24, 1], ['C', 6, 25, 1], ['E', 6, 26, 1], ['G', 6, 27, 1],
			['F', 6, 28, 1], ['E', 6, 29, 1], ['C', 6, 30, 1], ['G', 5, 31, 1],
			['G', 5, 32, 1], ['C', 6, 33, 1], ['D', 6, 34, 1], ['E', 6, 35, 1],
			['G', 6, 36, 1], ['E', 6, 37, 1], ['C', 6, 38, 1], ['G', 5, 39, 1],
			['A', 5, 40, 1], ['C', 6, 41, 1], ['E', 6, 42, 1], ['C', 6, 43, 1],
			['F', 5, 44, 1], ['A', 5, 45, 1], ['C', 6, 46, 1], ['F', 6, 47, 1],
		]),
	}),

	stage2: build({
		tempo: 152,
		bars: 16,
		chords: [chord('E', 3, 'min'), chord('C', 3, 'maj'), chord('G', 3, 'maj'), chord('D', 3, 'maj')],
		arpPattern: 'up16',
		arpVol: 0.17,
		padVol: 0.08,
		bassVol: 0.34,
		drums: { kick: [0, 1.5, 2, 3.5], snare: [1, 3], hat: H16 },
		melody: mel([
			['E', 5, 0, 0.5], ['G', 5, 0.5, 0.5], ['B', 5, 1, 1], ['G', 5, 2, 0.5], ['E', 5, 2.5, 0.5],
			['D', 5, 3, 1],
			['E', 5, 4, 0.5], ['G', 5, 4.5, 0.5], ['C', 6, 5, 1], ['G', 5, 6, 0.5], ['E', 5, 6.5, 0.5],
			['C', 5, 7, 1],
			['G', 5, 8, 0.5], ['B', 5, 8.5, 0.5], ['D', 6, 9, 1], ['B', 5, 10, 0.5], ['G', 5, 10.5, 0.5],
			['G', 5, 11, 1],
			['F', 5, 12, 0.5], ['A', 5, 12.5, 0.5], ['D', 6, 13, 1], ['A', 5, 14, 0.5], ['F', 5, 14.5, 0.5],
			['D', 5, 15, 1],
			['E', 5, 16, 0.5], ['G', 5, 16.5, 0.5], ['B', 5, 17, 1], ['D', 6, 18, 0.5], ['B', 5, 18.5, 0.5],
			['G', 5, 19, 1],
			['E', 5, 20, 0.5], ['G', 5, 20.5, 0.5], ['C', 6, 21, 1], ['B', 5, 22, 0.5], ['G', 5, 22.5, 0.5],
			['E', 5, 23, 1],
			['G', 5, 24, 0.5], ['B', 5, 24.5, 0.5], ['D', 6, 25, 1], ['F', 6, 26, 0.5], ['D', 6, 26.5, 0.5],
			['B', 5, 27, 1],
			['A', 5, 28, 0.5], ['C', 6, 28.5, 0.5], ['E', 6, 29, 1], ['C', 6, 30, 0.5], ['A', 5, 30.5, 0.5],
			['F', 5, 31, 1],
			['E', 5, 32, 0.5], ['G', 5, 32.5, 0.5], ['B', 5, 33, 1], ['D', 6, 34, 0.5], ['E', 6, 34.5, 0.5],
			['G', 6, 35, 1],
			['E', 5, 36, 0.5], ['G', 5, 36.5, 0.5], ['C', 6, 37, 1], ['B', 5, 38, 0.5], ['G', 5, 38.5, 0.5],
			['E', 5, 39, 1],
			['G', 5, 40, 0.5], ['B', 5, 40.5, 0.5], ['D', 6, 41, 1], ['F', 6, 42, 0.5], ['D', 6, 42.5, 0.5],
			['B', 5, 43, 1],
			['A', 5, 44, 0.5], ['C', 6, 44.5, 0.5], ['E', 6, 45, 1], ['G', 6, 46, 0.5], ['E', 6, 46.5, 0.5],
			['C', 6, 47, 1],
		]),
	}),

	stage3: build({
		tempo: 150,
		bars: 16,
		chords: [chord('D', 3, 'maj'), chord('A', 3, 'maj'), chord('B', 3, 'min'), chord('G', 3, 'maj')],
		arpPattern: 'up16',
		arpVol: 0.15,
		padVol: 0.1,
		bassVol: 0.3,
		drums: { kick: [0, 2], snare: [1, 3], hat: H8 },
		melody: mel([
			['D', 5, 0, 1], ['F#', 5, 1, 1], ['A', 5, 2, 1], ['F#', 5, 3, 1],
			['D', 5, 4, 1], ['A', 4, 5, 1], ['D', 5, 6, 1], ['F#', 5, 7, 1],
			['A', 5, 8, 1], ['C#', 6, 9, 1], ['E', 6, 10, 1], ['C#', 6, 11, 1],
			['A', 5, 12, 1], ['F#', 5, 13, 1], ['D', 5, 14, 1], ['F#', 5, 15, 1],
			['D', 5, 16, 1], ['F#', 5, 17, 1], ['A', 5, 18, 1], ['B', 5, 19, 1],
			['D', 6, 20, 1], ['B', 5, 21, 1], ['A', 5, 22, 1], ['F#', 5, 23, 1],
			['B', 5, 24, 1], ['D', 6, 25, 1], ['F#', 6, 26, 1], ['A', 6, 27, 1],
			['G', 6, 28, 1], ['F#', 6, 29, 1], ['D', 6, 30, 1], ['A', 5, 31, 1],
			['G', 5, 32, 1], ['B', 5, 33, 1], ['D', 6, 34, 1], ['F#', 6, 35, 1],
			['G', 6, 36, 1], ['F#', 6, 37, 1], ['D', 6, 38, 1], ['B', 5, 39, 1],
			['A', 5, 40, 1], ['C#', 6, 41, 1], ['E', 6, 42, 1], ['C#', 6, 43, 1],
			['F#', 5, 44, 1], ['A', 5, 45, 1], ['D', 6, 46, 1], ['F#', 6, 47, 1],
		]),
	}),

	boss: build({
		tempo: 168,
		bars: 16,
		chords: [chord('A', 3, 'min'), chord('G', 3, 'maj'), chord('F', 3, 'maj'), chord('E', 3, 'min')],
		arpPattern: 'up16',
		arpVol: 0.18,
		padVol: 0.07,
		bassVol: 0.36,
		drums: { kick: [0, 0.75, 1.5, 2, 2.75, 3.5], snare: [1, 3], hat: H16 },
		melody: mel([
			['A', 5, 0, 0.25], ['A', 5, 0.25, 0.25], ['C', 6, 0.5, 0.5], ['A', 5, 1, 0.5], ['E', 5, 1.5, 0.5],
			['A', 5, 2, 0.25], ['C', 6, 2.25, 0.25], ['E', 6, 2.5, 0.5], ['C', 6, 3, 1],
			['G', 5, 4, 0.25], ['G', 5, 4.25, 0.25], ['B', 5, 4.5, 0.5], ['G', 5, 5, 0.5], ['D', 5, 5.5, 0.5],
			['G', 5, 6, 0.25], ['B', 5, 6.25, 0.25], ['D', 6, 6.5, 0.5], ['B', 5, 7, 1],
			['F', 5, 8, 0.25], ['F', 5, 8.25, 0.25], ['A', 5, 8.5, 0.5], ['F', 5, 9, 0.5], ['C', 5, 9.5, 0.5],
			['F', 5, 10, 0.25], ['A', 5, 10.25, 0.25], ['C', 6, 10.5, 0.5], ['A', 5, 11, 1],
			['E', 5, 12, 0.25], ['E', 5, 12.25, 0.25], ['G', 5, 12.5, 0.5], ['E', 5, 13, 0.5], ['B', 4, 13.5, 0.5],
			['E', 5, 14, 0.25], ['G', 5, 14.25, 0.25], ['B', 5, 14.5, 0.5], ['G', 5, 15, 1],
			['A', 5, 16, 0.25], ['A', 5, 16.25, 0.25], ['C', 6, 16.5, 0.5], ['A', 5, 17, 0.5], ['E', 5, 17.5, 0.5],
			['A', 5, 18, 0.25], ['C', 6, 18.25, 0.25], ['E', 6, 18.5, 0.5], ['G', 6, 19, 1],
			['G', 5, 20, 0.25], ['G', 5, 20.25, 0.25], ['B', 5, 20.5, 0.5], ['G', 5, 21, 0.5], ['D', 5, 21.5, 0.5],
			['G', 5, 22, 0.25], ['B', 5, 22.25, 0.25], ['D', 6, 22.5, 0.5], ['B', 5, 23, 1],
			['F', 5, 24, 0.25], ['F', 5, 24.25, 0.25], ['A', 5, 24.5, 0.5], ['F', 5, 25, 0.5], ['C', 5, 25.5, 0.5],
			['F', 5, 26, 0.25], ['A', 5, 26.25, 0.25], ['C', 6, 26.5, 0.5], ['E', 6, 27, 1],
			['E', 5, 28, 0.25], ['E', 5, 28.25, 0.25], ['G', 5, 28.5, 0.5], ['E', 5, 29, 0.5], ['B', 4, 29.5, 0.5],
			['E', 5, 30, 0.25], ['G', 5, 30.25, 0.25], ['B', 5, 30.5, 0.5], ['D', 6, 31, 1],
			['A', 5, 32, 0.25], ['A', 5, 32.25, 0.25], ['C', 6, 32.5, 0.5], ['E', 6, 33, 0.5], ['A', 6, 33.5, 0.5],
			['G', 6, 34, 0.25], ['E', 6, 34.25, 0.25], ['C', 6, 34.5, 0.5], ['A', 5, 35, 1],
			['G', 5, 36, 0.25], ['G', 5, 36.25, 0.25], ['B', 5, 36.5, 0.5], ['D', 6, 37, 0.5], ['G', 6, 37.5, 0.5],
			['F', 6, 38, 0.25], ['D', 6, 38.25, 0.25], ['B', 5, 38.5, 0.5], ['G', 5, 39, 1],
			['F', 5, 40, 0.25], ['F', 5, 40.25, 0.25], ['A', 5, 40.5, 0.5], ['C', 6, 41, 0.5], ['F', 6, 41.5, 0.5],
			['E', 6, 42, 0.25], ['C', 6, 42.25, 0.25], ['A', 5, 42.5, 0.5], ['F', 5, 43, 1],
			['E', 5, 44, 0.25], ['E', 5, 44.25, 0.25], ['G', 5, 44.5, 0.5], ['B', 5, 45, 0.5], ['E', 6, 45.5, 0.5],
			['D', 6, 46, 0.25], ['B', 5, 46.25, 0.25], ['G', 5, 46.5, 0.5], ['E', 5, 47, 1],
		]),
	}),

	gameover: build({
		tempo: 72,
		bars: 8,
		chords: [chord('A', 3, 'min'), chord('F', 3, 'maj'), chord('C', 3, 'maj'), chord('G', 3, 'maj'),
			chord('A', 3, 'min'), chord('F', 3, 'maj'), chord('C', 3, 'maj'), chord('E', 3, 'min')],
		arpPattern: 'none',
		padVol: 0.14,
		bassVol: 0.24,
		drums: { kick: [0] },
		melody: mel([
			['E', 5, 0, 3], ['D', 5, 3, 1],
			['C', 5, 4, 3], ['A', 4, 7, 1],
			['G', 4, 8, 2], ['E', 4, 10, 2],
			['D', 4, 12, 2], ['B', 4, 14, 2],
			['E', 5, 16, 3], ['D', 5, 19, 1],
			['C', 5, 20, 3], ['A', 4, 23, 1],
			['G', 4, 24, 2], ['E', 4, 26, 2],
			['B', 4, 28, 3], ['A', 4, 31, 1],
		], 'lead', 0.26),
	}),

	win: build({
		tempo: 126,
		bars: 8,
		chords: [chord('C', 3, 'maj'), chord('G', 3, 'maj'), chord('A', 3, 'min'), chord('F', 3, 'maj'),
			chord('C', 3, 'maj'), chord('G', 3, 'maj'), chord('F', 3, 'maj'), chord('G', 3, 'maj')],
		arpPattern: 'up8',
		arpVol: 0.14,
		padVol: 0.1,
		bassVol: 0.28,
		drums: { kick: [0, 2], snare: [1, 3], hat: H8 },
		melody: mel([
			['C', 5, 0, 1], ['E', 5, 1, 1], ['G', 5, 2, 1], ['C', 6, 3, 1],
			['G', 5, 4, 1], ['E', 5, 5, 1], ['G', 5, 6, 1], ['B', 5, 7, 1],
			['A', 5, 8, 1], ['C', 6, 9, 1], ['E', 6, 10, 1], ['A', 6, 11, 1],
			['F', 5, 12, 1], ['A', 5, 13, 1], ['C', 6, 14, 1], ['F', 6, 15, 1],
			['C', 5, 16, 1], ['E', 5, 17, 1], ['G', 5, 18, 1], ['C', 6, 19, 1],
			['G', 5, 20, 1], ['B', 5, 21, 1], ['D', 6, 22, 1], ['G', 6, 23, 1],
			['F', 5, 24, 1], ['A', 5, 25, 1], ['C', 6, 26, 1], ['A', 5, 27, 1],
			['G', 5, 28, 1], ['B', 5, 29, 1], ['D', 6, 30, 1], ['G', 6, 31, 1],
		]),
	}),
};

// ---------- MusicSys ----------
export class MusicSys {
	private ctx: AudioContext | null = null;
	private master: GainNode | null = null;
	private current: TrackName | null = null;
	private desired: TrackName | null = null;
	private timer: number | null = null;
	private noteIndex = 0;
	private loopStart = 0;
	muted = false;

	private static readonly MASTER_VOL = 0.5;
	private static readonly LOOKAHEAD = 0.12;

	private ensure(): AudioContext | null {
		if (!this.ctx) {
			try {
				this.ctx = new AudioContext();
			} catch {
				return null;
			}
		}
		if (this.ctx.state === 'suspended') void this.ctx.resume();
		if (!this.master && this.ctx) {
			this.master = this.ctx.createGain();
			this.master.gain.value = this.muted ? 0 : MusicSys.MASTER_VOL;
			this.master.connect(this.ctx.destination);
		}
		return this.ctx;
	}

	unlock(): void {
		const ctx = this.ensure();
		if (!ctx) return;
		const start = (): void => {
			if (this.desired && this.ctx?.state === 'running') this.play(this.desired);
		};
		if (ctx.state === 'running') start();
		else void ctx.resume().then(start).catch(() => {});
	}

	setMuted(m: boolean): void {
		this.muted = m;
		if (this.master && this.ctx) this.master.gain.value = m ? 0 : MusicSys.MASTER_VOL;
	}

	play(name: TrackName): void {
		this.desired = name;
		const ctx = this.ensure();
		if (!ctx || ctx.state !== 'running' || !this.master) return;
		const track = TRACKS[name];
		if (!track) return;
		this.stopSeq();
		this.current = name;
		const spb = 60 / track.tempo;
		this.loopStart = ctx.currentTime + 0.08;
		this.noteIndex = 0;
		this.loopDur = track.beats * spb;
		this.track = track;
		this.timer = window.setInterval(() => this.tick(), 25);
		this.tick();
	}

	stop(): void {
		this.desired = null;
		this.current = null;
		this.stopSeq();
	}

	private track: Track | null = null;
	private loopDur = 0;

	private tick(): void {
		const ctx = this.ctx;
		const track = this.track;
		const master = this.master;
		if (!ctx || !track || !master || ctx.state !== 'running') return;
		const now = ctx.currentTime;
		const spb = 60 / track.tempo;
		while (now >= this.loopStart + this.loopDur) {
			this.loopStart += this.loopDur;
			this.noteIndex = 0;
		}
		while (this.noteIndex < track.events.length) {
			const ev = track.events[this.noteIndex];
			const t = this.loopStart + ev.beat * spb;
			if (t > now + MusicSys.LOOKAHEAD) break;
			if (t >= now - 0.03) playEvent(ctx, master, ev, Math.max(t, now + 0.005));
			this.noteIndex++;
			if (this.noteIndex >= track.events.length) {
				this.noteIndex = 0;
				this.loopStart += this.loopDur;
			}
		}
	}

	private stopSeq(): void {
		if (this.timer !== null) {
			window.clearInterval(this.timer);
			this.timer = null;
		}
		this.track = null;
	}

	get playing(): TrackName | null {
		return this.current;
	}
}
