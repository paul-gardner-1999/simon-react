import {describe, expect, test} from 'vitest';
import {type GameAction, type GameState, gameMessage, gameReducer, initialGameState, nextTimer} from './simon';

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state)

// Advance through the countdown and playback of the current round
const playRound = (state: GameState) => {
    while (state.phase !== 'repeatNotes') {
        const timer = nextTimer(state, 300)
        if (timer === undefined) throw new Error(`stuck in ${state.phase}`)
        state = gameReducer(state, timer.action)
    }
    return state
}

describe('gameReducer', () => {
    test('start begins round 1 with a countdown', () => {
        const state = run(initialGameState, {type: 'start', firstNote: 'red'})
        expect(state).toMatchObject({phase: 'getReady', notes: ['red'], countdown: 3})
        expect(gameMessage(state)).toBe('Round 1: Get Ready! 3')
    })

    test('countdown ticks down then plays the first note', () => {
        let state = run(initialGameState, {type: 'start', firstNote: 'red'}, {type: 'countdownTick'}, {type: 'countdownTick'})
        expect(state.countdown).toBe(1)
        state = gameReducer(state, {type: 'countdownTick'})
        expect(state).toMatchObject({phase: 'playNotes', index: 0, tone: 'red'})
    })

    test('playback alternates note and gap, then waits for the player', () => {
        let state: GameState = {...initialGameState, phase: 'playNotes', notes: ['red', 'red'], tone: 'red'}
        expect(nextTimer(state, 300)).toEqual({delayMs: 300, action: {type: 'noteOff'}})
        state = run(state, {type: 'noteOff'}, {type: 'nextNote'})
        expect(state).toMatchObject({phase: 'playNotes', index: 1, tone: 'red'})
        state = run(state, {type: 'noteOff'}, {type: 'nextNote'})
        expect(state).toMatchObject({phase: 'repeatNotes', index: 0, tone: undefined})
    })

    test('repeating the sequence correctly starts the next round with one more note', () => {
        let state = playRound(run(initialGameState, {type: 'start', firstNote: 'red'}))
        state = gameReducer(state, {type: 'press', color: 'red', nextNote: 'blue'})
        expect(state).toMatchObject({phase: 'getReady', notes: ['red', 'blue']})

        state = playRound(state)
        state = gameReducer(state, {type: 'press', color: 'red', nextNote: 'green'})
        expect(state).toMatchObject({phase: 'repeatNotes', index: 1})
        state = gameReducer(state, {type: 'press', color: 'blue', nextNote: 'green'})
        expect(state.notes).toEqual(['red', 'blue', 'green'])
    })

    test('a wrong press fails, then returns to attract keeping the reached round', () => {
        let state = playRound(run(initialGameState, {type: 'start', firstNote: 'red'}))
        state = gameReducer(state, {type: 'press', color: 'yellow', nextNote: 'blue'})
        expect(state).toMatchObject({phase: 'failure', tone: 'fail'})
        expect(gameMessage(state)).toBe('Game Over')
        state = gameReducer(state, {type: 'failureDone'})
        expect(state).toMatchObject({phase: 'attract', notes: ['red'], tone: undefined})
        expect(gameMessage(state)).toBe('Please Try Again')
    })

    test('presses outside repeatNotes are ignored', () => {
        const state = run(initialGameState, {type: 'start', firstNote: 'red'})
        expect(gameReducer(state, {type: 'press', color: 'blue', nextNote: 'red'})).toBe(state)
    })

    test('no message before the first game', () => {
        expect(gameMessage(initialGameState)).toBeUndefined()
    })
})
