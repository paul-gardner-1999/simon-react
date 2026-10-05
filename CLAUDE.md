# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Vite + React 19 + TypeScript, tested with Vitest (jsdom).

- `npm start` / `npm run dev` — dev server on http://localhost:3000
- `npm run build` — `tsc -b` type-check, then production build into `dist/`
- `npm run lint` — ESLint (flat config in `eslint.config.js`)
- `npm test` — Vitest in watch mode; `npx vitest run` for a single run
- `npx vitest run src/game/simon.test.ts` or `npx vitest run -t "<test name>"` — run one file / test
- Docker: `docker build -t <user>/<repo> .` then `docker run -d -p 80:3000 <user>/<repo>` (runs the dev server, not a production build)

TypeScript is pinned to `~6.0` because typescript-eslint does not yet support TS 7. `react-popper` (pulled in by reactstrap dropdowns) declares a React ≤18 peer range; it works with React 19 and is covered by the dropdown test in `App.test.tsx`.

## Architecture

A Simon memory game. Game logic is pure and separate from React:

- **`src/game/simon.ts`** — the whole game as data: `GameState` (`phase`, `notes`, `countdown`, `index`, `tone`), a `gameReducer`, plus `nextTimer(state, playDurationMs)` (which timed action the current state is waiting on) and `gameMessage(state)` (derived UI text). Randomness is injected through action payloads (`start.firstNote`, `press.nextNote`) so the reducer stays deterministic. Phases: `attract → getReady (countdown) → playNotes (note/gap alternation) → repeatNotes → getReady…` or `→ failure → attract`.
- **`src/store/useSimonStore.ts`** — a Zustand store holding `difficulty`, `volume`, and `game`; `dispatch(action)` runs `gameReducer`. Both `Navigation` (Start button dispatches `start`; difficulty/volume setters) and `Simon` read it. "Game active" is derived (`phase !== 'attract'`), not stored.
- **`src/components/Simon.tsx`** — the only place with side effects. One effect drives the game: it asks `nextTimer` for the next action and schedules it with `setTimeout` (re-run whenever `game` changes). Another plays/stops sound whenever the active tone changes. The lit button / sound is `game.tone ?? pressed`, where `pressed` is local state for the button the player is holding; a note is submitted on pointer up/leave.
- **`src/components/Audio.ts`** — a single `Audio` instance exposed as the default value of `AudioPlayerContext` (no provider needed). Tones are square-wave `OscillatorNode`s from the Web Audio API — no audio files.

Visuals: the round board is square divs shaped/rotated in `Simon.css`; reactstrap/Bootstrap 5 provide layout and the navbar. Timings, round count, and volume bounds live in `Constants.tsx`; per-difficulty note length is `DIFFICULTY_TO_PLAY_DURATION_MS` in `simon.ts`.

## Testing notes

- Reducer logic is unit-tested in `src/game/simon.test.ts`; prefer adding cases there.
- `App.test.tsx` plays the game with fake timers. jsdom has no Web Audio, so it stubs `AudioContext`. Because each timer is scheduled by an effect after the previous render, advance fake time in small steps, each in its own `act()` (see the `advance` helper). Reset the store with `useSimonStore.setState({game: initialGameState})` between tests — it is a module-level singleton.
