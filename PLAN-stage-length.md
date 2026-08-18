# Plan: Lengthen stages so the music can be appreciated

Context: the stage 1 track (see `PLAN-stage1-track.md`) is the full 576-beat
"Unforgettable Greenery" transcription (~3:34), but the stage was only 900 frames
(15s), so the boss spawned — and boss music took over — after ~4% of the song.
The user wants the stages to last long enough to enjoy the music.

User decisions (confirmed):
- **Stage 1 pre-boss = one full song** (boss spawns as the 576-beat song ends),
  computed from beats/tempo so it stays in sync.
- **Redistribute waves to match song sections** so the stage stays active.
- **All three stages** lengthened for pacing balance.

## Findings
- Stage 1 song: 576 beats @ 161.65 BPM = 3:34 = `12,828` frames @ 60fps.
- Current pre-boss lengths: s1 `900` (15s), s2 `960` (16s), s3 `1020` (17s)
  (`src/stages.ts:128,185,243`).
- `def.length` only triggers the boss (`src/stage.ts:31`); boss music then plays
  (`src/game.ts:256-259`). Nothing else depends on it.
- Extending `length` alone would leave a long empty stage, so waves must be
  redistributed too.

## Changes (all in `src/stages.ts`)
1. **Stage 1 length = one full song.** Import `S1_BEATS`, `S1_TEMPO` from
   `./data/stage1` and `FPS` from `./config`. Replace `length: 900` with
   `length: Math.round(S1_BEATS * (60 / S1_TEMPO) * FPS)` (= 12,828).
2. **Stages 2/3 length** → `12800` (≈3:33, matching stage 1). Tunable.
3. **Stage 1 waves → matched to song sections.** Section boundaries in frames
   (1 beat ≈ 22.27f): intro 0–356, A 356–4988, transition 4988–6770,
   B 6770–11402, outro 11402–12828. ~22 waves, one every ~10–13s, midboss in
   A and B:
   - Intro: `150` row5 flyer
   - A: `500` sine fan, `1100` fast aimed3, `1700` sine ring4, `2300` flyer,
     `2900` sine fan5, `3500` fast aimed3, `4100` sine ring4, `4550` midboss
   - Transition: `5200` flyer, `5800` sine, `6400` fast aimed3
   - B: `7000` sine ring4, `7600` fast aimed3, `8200` sine fan5, `8800` fast
     aimed1, `9400` midboss, `10000` fast aimed3, `10600` sine ring4, `11100` flyer
   - Outro: `11600` sine, `12100` fast aimed3, `12550` sine ring4
4. **Stages 2/3 waves → re-timed across 0–12800.** Keep existing wave
   types/patterns, spread ~16 waves evenly (~every 800 frames), midboss near
   the 60–70% mark (≈5600–6400).

## Verification
- `npm run typecheck` && `npm run build`
- `npm run dev` → stage 1: song plays fully (~3:34) before the boss; waves flow
  across all sections. Stages 2/3 run ~3:33 with active waves.

## Notes
- Boss-fight length is unchanged (independent of stage length).
- Stages 2/3 music still loops (short 16-bar loops); only pre-boss duration changes.
- Enemy pool (48) is safe: waves ~10s apart, rows clear before the next spawns.
