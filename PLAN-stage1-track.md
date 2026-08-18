# Plan: Transcribe "That Unforgettable Greenery of Connection" into the `stage1` track

Source: TH15 stage 1 theme "That Unforgettable Greenery of Connection ~ 幻想郷の懐かしき緑"
(`/home/sencyy/Downloads/th15s1.mid`, format 1, 10 tracks, 480 tpq, 4/4, 371170 µs/qtr ≈ 161.65 BPM, key B minor).

Scope (user-confirmed): **full song (576 beats / 144 bars, ~3.5 min)**, melody faithful,
**synthesized drum groove**, **separate data module**. Mirrors the title-track approach.
Stage 2/3 follow the same pattern later (out of scope now).

## 1. Data extraction → `src/data/stage1.ts` (generated, committed)
A node script (run from `/tmp/opencode`, **not** committed) parses the MIDI and emits a compact
ESM module exporting per-voice `[beat, len, midi]` arrays:
- **lead** ← ch0 ∪ ch1 (dual melody, two notes/beat) + ch2 (B-section secondary lead)
- **arp** ← ch4 (16th-note B-minor arps)
- **bass** ← ch9 (main 16th bass); ch5/ch6/ch7 available if more density is wanted
- **pad** ← ch8 (chord hits, ≤6 notes)

Extraction: quantize to 16ths (120 ticks), compute `len` from note-on→off per (channel, pitch),
dedupe overlapping same-pitch notes. Also export `TEMPO = 161.65`, `BEATS = 576`.

## 2. Dedicated builder in `src/music.ts`
`function stage1Track(): Track` → `{ tempo: 161.65, beats: 576, events }`, importing
`src/data/stage1.ts` and expanding `[beat,len,midi]` into `Ev[]` (lead/arp/bass/pad).
Replace the `stage1: build({...})` entry (`src/music.ts:331–354`) with `stage1: stage1Track()`.
Leave `build()` and the other six tracks untouched.

## 3. Synthesized drum groove (in the builder)
No drum channel in the MIDI, so generate per-section (mirroring the title's light→full→light build):
- **Intro** (b0–16) / **Outro** (b512–576): kick 0/2, 8th hats, no snare
- **A** (b16–224) / **B** (b304–512): kick 0/1.5/2/3.5, snare 1/3, 16th hats
- **Transition** (b224–304): kick 0/2, snare 2, 8th hats

## 4. Copyright comment
Update `src/music.ts:2–3` to state stage1 is a transcription of the TH15 stage 1 theme
(user-approved exception to "originals only").

## 5. Verification
- `npm run typecheck` + `npm run build`
- Node verify script (like `verify.mjs`) importing the generated data: total event count,
  per-voice note/beat ranges, no out-of-range beats, spot-check the A-section lead (b16–48)
  + arp (b0–16)
- Listen on stage 1 via `npm run dev`

## Notes
- **Scale:** ~9,000+ events; the data module keeps `music.ts` clean. The WebAudio scheduler
  (25 ms tick, 120 ms lookahead) handles it fine.
- **SEMI bug:** unaffected — this track uses raw MIDI numbers from the data module (same as the title).
- **Lead register:** kept as-is (A3–F#6); a −12 transpose is a one-line knob if it sounds too high.
- **Stage 2/3:** out of scope now; same pattern (own TH15 theme MIDI → data module → dedicated builder).
