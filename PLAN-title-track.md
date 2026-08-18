# Plan: Transcribe "The Space Shrine Maiden Appears" into the `title` track

Source: TH15 menu theme "The Space Shrine Maiden Appears ~ Karl Zuñiga"
(`/tmp/opencode/midi_raw`, format 1, 15 tracks, 96 tpq, 4/2, 150 BPM).

Scope (user-confirmed): **full verse b0–95 (~96 beats / 24 bars)**, melody **−1 octave**
(A5–D6 register), **faithful 8th-note hook + arps**.

## 1. New dedicated builder in `src/music.ts`
`build()` is too rigid for this piece (bass fixed to beats 0/2, identical drums every
bar, one chord per bar). Add `function titleTrack(): Track` returning
`{ tempo: 150, beats: 96, events }`, built from compact data arrays + small push helpers.
Replace the `title: build({...})` entry (line 261) with `title: titleTrack()`.
Leave `build()` and the other six tracks untouched.

## 2. Data extraction (node script over `/tmp/opencode/midi_raw`)
- **Melody → `lead`**: topmost sounding note per half-beat across ch0/1/4/6/7, b0–95,
  transposed −12. Duration = gap to next note (held A5 b36–43, held D6 b44–47).
- **Arp → `arp`**: 16th-note accompaniment. Intro (b0–15) from the piano arp; main
  section a 16th cycle over the per-bar chord.
- **Pad → `pad`**: per-bar reduced chord (≤4 notes) from sustained ensemble notes
  (ch3/5/7/8), 4-beat holds.
- **Bass → `bass`**: ch11 notes (MIDI 34–55) transposed −12, real beat/duration, b0–79.
- **Drums → kick/snare/hat**: ch9, 36→kick, 38/40→snare, 42/43/44/46→hat, quantized to
  16ths, deduped per bar; drums enter b1.

## 3. Section layout (96 beats / 24 bars)
- b0–15: arp intro, drums in b1, no melody
- b16–63: full 8th-note hook + arp/pad/bass/drums
- b64–79: transition (D5/E5 line), full drums
- b80–95: lead drops to F3/B3/C#4 region, no bass, lighter drums

## 4. Copyright comment
Update the note at `src/music.ts:2` to state the title track is a transcription of the
TH15 menu theme (user-approved exception to "originals only").

## 5. Verification
`npm run typecheck` + `npm run build`; listen on the title screen via `npm run dev`.

## Note: pre-existing `SEMI` bug (out of scope, flagged)
The `SEMI` table maps F–B one semitone low, so the other six tracks sound a semitone
flat for notes F and above. This track uses raw MIDI numbers so it is unaffected. Fixing
`SEMI` would shift the other tracks' pitch and is left for a separate decision.
