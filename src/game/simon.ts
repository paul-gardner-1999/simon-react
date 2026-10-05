// Pure Simon game logic: state, reducer, and the timers each state needs.
// No React or browser APIs here, so it can be unit tested directly.
import {Constants} from '../components/Constants';

export const BUTTONS = ['yellow', 'green', 'blue', 'red'] as const
export type Color = typeof BUTTONS[number]
export type Tone = Color | 'fail'
export type Difficulty = 'easy' | 'normal' | 'hard'

export const DIFFICULTY_TO_PLAY_DURATION_MS: Record<Difficulty, number> = {
    easy: 500,
    normal: 300,
    hard: 200
}

export const AUDIO_FREQUENCY_MAP: Record<Tone, number> = {
    blue: 164.81,   // E
    red: 110,       // A
    green: 82.41,   // E octave below
    yellow: 138.59, // C#
    fail: 49.0
};

// Silence between consecutive notes during playback
export const NOTE_GAP_MS = 20

export type Phase = 'attract' | 'getReady' | 'playNotes' | 'repeatNotes' | 'failure'

export interface GameState {
    phase: Phase
    notes: Color[]
    countdown: number
    // playNotes: the note being played. repeatNotes: the next note the player must press.
    index: number
    // The tone the game is sounding (and the button it lights), separate from player presses
    tone: Tone | undefined
}

export type GameAction =
    | { type: 'start', firstNote: Color }
    | { type: 'countdownTick' }
    | { type: 'noteOff' }
    | { type: 'nextNote' }
    | { type: 'press', color: Color, nextNote: Color }
    | { type: 'failureDone' }

export const initialGameState: GameState = {
    phase: 'attract',
    notes: [],
    countdown: 0,
    index: 0,
    tone: undefined
}

export const randomColor = (): Color => BUTTONS[Math.floor(Math.random() * BUTTONS.length)]

const beginRound = (notes: Color[]): GameState => ({
    phase: 'getReady',
    notes,
    countdown: Constants.GET_READY_COUNTDOWN_STEPS,
    index: 0,
    tone: undefined
})

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'start':
            return beginRound([action.firstNote])
        case 'countdownTick':
            if (state.phase !== 'getReady') return state
            if (state.countdown > 1) return {...state, countdown: state.countdown - 1}
            return {...state, phase: 'playNotes', countdown: 0, index: 0, tone: state.notes[0]}
        case 'noteOff':
            if (state.phase !== 'playNotes') return state
            return {...state, tone: undefined}
        case 'nextNote': {
            if (state.phase !== 'playNotes') return state
            const index = state.index + 1
            if (index < state.notes.length) return {...state, index, tone: state.notes[index]}
            return {...state, phase: 'repeatNotes', index: 0, tone: undefined}
        }
        case 'press': {
            if (state.phase !== 'repeatNotes') return state
            if (action.color !== state.notes[state.index]) return {...state, phase: 'failure', tone: 'fail'}
            const index = state.index + 1
            if (index < state.notes.length) return {...state, index}
            return beginRound([...state.notes, action.nextNote])
        }
        case 'failureDone':
            if (state.phase !== 'failure') return state
            return {...state, phase: 'attract', tone: undefined}
    }
}

// The timed action (if any) that should fire while the game sits in `state`.
export function nextTimer(state: GameState, playDurationMs: number): { delayMs: number, action: GameAction } | undefined {
    switch (state.phase) {
        case 'getReady':
            return {delayMs: 1000, action: {type: 'countdownTick'}}
        case 'playNotes':
            return state.tone !== undefined
                ? {delayMs: playDurationMs, action: {type: 'noteOff'}}
                : {delayMs: NOTE_GAP_MS, action: {type: 'nextNote'}}
        case 'failure':
            return {delayMs: Constants.LOST_MESSAGE_WAIT_TIME_MS, action: {type: 'failureDone'}}
        default:
            return undefined
    }
}

export function gameMessage(state: GameState): string | undefined {
    switch (state.phase) {
        case 'getReady':
            return `Round ${state.notes.length}: Get Ready! ${state.countdown}`
        case 'playNotes':
            return 'Listen'
        case 'repeatNotes':
            return 'Now repeat what you heard.'
        case 'failure':
            return 'Game Over'
        case 'attract':
            return state.notes.length > 0 ? 'Please Try Again' : undefined
    }
}
