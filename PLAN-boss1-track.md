# Plan: Transcribe "The Rabbit Has Landed" into the `boss1` track

Source: TH15 boss 1 theme "The Rabbit Has Landed ~ 月見酒"
(`/home/sencyy/Downloads/th15b1.mid`, format 1, 11 tracks, 120 tpq, 4/4,
342857 µs/qtr = 175.00 BPM, key B minor, 272 beats / 68 bars ≈ 93 s, no drum channel).

Scope (user-confirmed): **full song (272 beats)**, **full fidelity** (all channels,
32nd-note quantization), **synthesized drum groove**, **separate data module**.
Mirrors the stage1-track approach. Stage 2/3 bosses keep the generic `boss` track
(out of scope now; same "follow later" pattern).

## 1. Data extraction → `src/data/boss1.ts` (generated, committed)
A node script (run from `/tmp/opencode`, **not** committed) parses the MIDI and emits a
compact ESM module exporting per-voice `[beat, len, midi]` arrays, quantized to
**32nds (15 ticks)**:
- **lead** ← ch0 ∪ ch1 (dual guitar melody, B-note intro) + ch2 (fiddle counter-lead, enters b14)
- **arp** ← ch3 (16th B-minor arps, whole song) ∪ ch7 (32nd-note organ riff, b64–96 & b128–224)
- **bass** ← ch4 (root 8ths) ∪ ch5 (break/outro 8ths) ∪ ch9 (driving 16th riff, main)
- **pad** ← ch6 (piano 8th chords, intro/break/outro) ∪ ch8 (sustained roots)

Extraction: quantize to 32nds, compute `len` from note-on→off per (channel, pitch),
min len 0.25, dedupe overlapping same-pitch notes per (beat, midi). Also export
`TEMPO = 175`, `BEATS = 272`.

## 2. Dedicated builder in `src/music.ts`
`function boss1Track(): Track` → `{ tempo: 175, beats: 272, events }`, importing
`src/data/boss1.ts` and expanding `[beat,len,midi]` into `Ev[]` with the same volumes
as stage1 (lead 0.22, arp 0.12, bass 0.28, pad 0.09). Add `'boss1'` to `TrackName`
and `boss1: boss1Track()` to `TRACKS`. Leave `build()`, the other tracks, and
title/stage1 untouched.

## 3. Synthesized drum groove (in the builder), per section
| Section | Beats | Drums |
|---|---|---|
| Intro | b0–16 | kick 0/2, 8th hats |
| A | b16–96 | kick 0/1.5/2/3.5, snare 1/3, 16th hats |
| Break (piano, no lead) | b96–112 | kick 0/2, snare 2, 8th hats |
| B | b112–224 | kick 0/1.5/2/3.5, snare 1/3, 16th hats |
| Outro | b224–256 | kick 0/2, 8th hats |
| Finale (lead reprise) | b256–272 | kick 0/1.5/2/3.5, snare 1/3, 16th hats |

## 4. Game wiring
`src/game.ts:258`: `this.music.play('boss')` →
`this.music.play(this.stageIndex === 0 ? 'boss1' : 'boss')`
(stageIndex is already set in `startStage`).

## 5. Copyright comment
Update `src/music.ts:2–4` to state boss1 is a transcription of the TH15 boss 1 theme
"The Rabbit Has Landed" (user-approved exception to "originals only").

## 6. Verification
- `npm run typecheck` + `npm run build`
- Node verify script (like `verify_stage1.mjs`): total event count, per-voice
  note/beat ranges, no out-of-range beats, spot-check intro lead (b0–16),
  organ 32nds (b64–72), ch9 riff (b16–24)
- Listen during the stage 1 boss fight via `npm run dev`

## Notes
- **Scale:** ~6,700 events (lead ~939, arp ~2,705, bass ~2,411, pad ~670) — comparable
  to stage1's ~9,000; the WebAudio scheduler (25 ms tick, 120 ms lookahead) handles it
  fine. 32nds at 175 BPM ≈ 23 notes/s on the organ — dense but OK.
- **SEMI bug:** unaffected — this track uses raw MIDI numbers from the data module
  (same as title/stage1).
- **Lead register:** kept as-is (B3–B5); a −12 transpose is a one-line knob if it
  sounds too high.
- **Looping:** boss fights may outlast 93 s; the track loops like all others.
- **Stage 2/3 bosses:** out of scope now; same pattern (own TH15 boss theme MIDI →
  data module → dedicated builder → `boss2`/`boss3` track names).
