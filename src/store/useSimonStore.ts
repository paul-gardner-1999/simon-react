import {create} from 'zustand';
import {type Difficulty, type GameAction, type GameState, gameReducer, initialGameState} from '../game/simon';

const INITIAL_VOLUME = 0.2

interface SimonStore {
    difficulty: Difficulty
    volume: number
    game: GameState
    setDifficulty: (difficulty: Difficulty) => void
    setVolume: (volume: number) => void
    dispatch: (action: GameAction) => void
}

// Shared between the navbar (start / difficulty / volume) and the game board.
export const useSimonStore = create<SimonStore>()(set => ({
    difficulty: 'normal',
    volume: INITIAL_VOLUME,
    game: initialGameState,
    setDifficulty: difficulty => set({difficulty}),
    setVolume: volume => set({volume}),
    dispatch: action => set(state => ({game: gameReducer(state.game, action)})),
}))

export const selectGameActive = (state: SimonStore): boolean => state.game.phase !== 'attract'
